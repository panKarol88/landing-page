require "test_helper"

class ApiTest < ActionDispatch::IntegrationTest
  setup do
    Post.delete_all
    ENV["ADMIN_PASSWORD"] = "test-password"
    ENV["SITE_URL"] = "http://localhost:5173"
  end

  test "published list excludes drafts" do
    create_post(title: "Visible", published: true)
    create_post(title: "Hidden", published: false)

    get "/api/v1/posts"

    assert_response :success
    response_json = JSON.parse(response.body)
    assert_equal [ "visible" ], response_json["posts"].pluck("slug")
    assert_equal 1, response_json.dig("meta", "total")
  end

  test "published slug show includes markdown" do
    create_post(title: "A Slugged Post", published: true, body_markdown: "# Hello")

    get "/api/v1/posts/a-slugged-post"

    assert_response :success
    assert_equal "# Hello", JSON.parse(response.body).dig("post", "body_markdown")
  end

  test "editor preserves published state and publication date" do
    post = create_post(title: "Published Editor Post", published: true)
    original_date = 3.days.ago.change(usec: 0)
    post.update_columns(published_at: original_date)
    token = login

    get "/api/v1/posts/#{post.slug}"

    assert_response :success
    show_post = JSON.parse(response.body).fetch("post")
    assert_equal true, show_post["published"]
    assert_equal original_date.iso8601(3), show_post["published_at"]

    patch "/api/v1/posts/#{post.slug}",
      params: { post: show_post.slice("title", "slug", "excerpt", "body_markdown", "tags", "cover_image_url", "published") },
      headers: auth_headers(token),
      as: :json

    assert_response :success
    assert_equal true, JSON.parse(response.body).dig("post", "published")
    assert_equal original_date, post.reload.published_at
  end

  test "writes require authentication" do
    post "/api/v1/posts", params: { post: { title: "Nope", body_markdown: "Nope" } }, as: :json

    assert_response :unauthorized
  end

  test "login succeeds and rejects a bad password" do
    post "/api/v1/session", params: { password: "wrong" }, as: :json
    assert_response :unauthorized

    post "/api/v1/session", params: { password: "test-password" }, as: :json
    assert_response :success
    assert JSON.parse(response.body)["token"].present?
  end

  test "publishing sets published_at" do
    token = login
    post "/api/v1/posts", params: { post: { title: "Publish Me", body_markdown: "Body" } }, headers: auth_headers(token), as: :json
    slug = JSON.parse(response.body).dig("post", "slug")

    patch "/api/v1/posts/#{slug}", params: { post: { published: true } }, headers: auth_headers(token), as: :json

    assert_response :success
    assert Post.find_by!(slug: slug).published_at.present?
  end

  test "unpublishing and republishing preserves the original publication date" do
    post = create_post(title: "Republish Me", published: true)
    original_date = 2.months.ago.change(usec: 0)
    post.update_columns(published_at: original_date)
    token = login

    patch "/api/v1/posts/#{post.slug}", params: { post: { published: false } },
      headers: auth_headers(token), as: :json
    assert_response :success
    assert_equal original_date, post.reload.published_at

    travel 1.day do
      patch "/api/v1/posts/#{post.slug}", params: { post: { published: true } },
        headers: auth_headers(token), as: :json
      assert_response :success
    end

    assert_equal original_date, post.reload.published_at
  end

  test "tag filter returns matching published posts" do
    create_post(title: "Ruby Post", published: true, tags: [ "ruby" ])
    create_post(title: "React Post", published: true, tags: [ "react" ])

    get "/api/v1/posts", params: { tag: "ruby" }

    assert_response :success
    assert_equal [ "ruby-post" ], JSON.parse(response.body)["posts"].pluck("slug")
  end

  test "RSS feed renders published markdown" do
    create_post(title: "Feed Post", published: true, body_markdown: "# Feed heading")

    get "/feed.xml"

    assert_response :success
    assert_includes response.body, '<rss version="2.0">'
    assert_includes response.body, "<![CDATA[<h1>Feed heading</h1>"
    assert_includes response.body, "<link>http://localhost:5173/blog/feed-post</link>"
    assert_includes response.body, "<guid isPermaLink=\"true\">"
  end

  private

  def create_post(attributes = {})
    Post.create!({ title: "Test post", body_markdown: "A useful body", tags: [] }.merge(attributes))
  end

  def login
    post "/api/v1/session", params: { password: "test-password" }, as: :json
    JSON.parse(response.body)["token"]
  end

  def auth_headers(token)
    { "Authorization" => "Bearer #{token}" }
  end
end
