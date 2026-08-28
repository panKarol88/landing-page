require "cgi"
require "redcarpet"

class FeedController < ApplicationController
  def show
    renderer = Redcarpet::Markdown.new(Redcarpet::Render::HTML.new(hard_wrap: true, filter_html: true))
    posts = Post.published.limit(20)
    items = posts.map do |post|
      link = "#{site_url}/blog/#{post.slug}"
      <<~ITEM
        <item>
          <title>#{escape_xml(post.title)}</title>
          <description>#{cdata(renderer.render(post.body_markdown))}</description>
          <pubDate>#{(post.published_at || post.created_at).rfc2822}</pubDate>
          <guid isPermaLink="true">#{escape_xml(link)}</guid>
          <link>#{escape_xml(link)}</link>
        </item>
      ITEM
    end.join

    xml = <<~XML
      <?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Karol's Engineering Blog</title>
          <description>Notes on software engineering by Karol.</description>
          <link>#{escape_xml(site_url)}</link>
          <lastBuildDate>#{Time.current.rfc2822}</lastBuildDate>
          #{items}
        </channel>
      </rss>
    XML
    render xml: xml
  end

  private

  def escape_xml(value)
    CGI.escapeHTML(value.to_s)
  end

  def cdata(html)
    "<![CDATA[#{html.to_s.gsub("]]>", "]]]]><![CDATA[>")}]]>"
  end

  def site_url
    ENV.fetch("SITE_URL", "http://localhost:5173").chomp("/")
  end
end
