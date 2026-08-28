module Api
  module V1
    class PostsController < ApplicationController
      before_action :authenticate_admin!, only: %i[create update destroy]

      def index
        posts = Post.published
        posts = posts.by_tag(params[:tag]) if params[:tag].present?
        page = positive_integer(params[:page], 1)
        per_page = [ [ positive_integer(params[:per_page], 10), 100 ].min, 1 ].max
        total = posts.count
        posts = posts.offset((page - 1) * per_page).limit(per_page)

        render json: {
          posts: posts.map { |post| serialize_post(post) },
          meta: { page: page, per_page: per_page, total: total, total_pages: (total / per_page.to_f).ceil }
        }
      end

      def show
        post = Post.find_by!(slug: params[:slug])
        raise ActiveRecord::RecordNotFound unless post.published? || current_admin?

        render json: { post: serialize_post(post, detailed: true) }
      end

      def create
        post = Post.new(post_params)
        return render_validation_errors(post) unless post.save

        render json: { post: serialize_post(post, detailed: true) }, status: :created
      end

      def update
        post = Post.find_by!(slug: params[:slug])
        return render_validation_errors(post) unless post.update(post_params)

        render json: { post: serialize_post(post, detailed: true) }
      end

      def destroy
        Post.find_by!(slug: params[:slug]).destroy!
        head :no_content
      end

      private

      def post_params
        params.require(:post).permit(:title, :slug, :excerpt, :body_markdown, :cover_image_url, :published, tags: [])
      end

      def positive_integer(value, default)
        parsed = Integer(value, exception: false)
        parsed && parsed.positive? ? parsed : default
      end

      def serialize_post(post, detailed: false)
        result = {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          cover_image_url: post.cover_image_url,
          tags: post.tags || [],
          published_at: post.published_at,
          reading_time_minutes: post.reading_time_minutes
        }
        result[:body_markdown] = post.body_markdown if detailed
        result
      end
    end
  end
end
