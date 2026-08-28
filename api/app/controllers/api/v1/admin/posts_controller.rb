module Api
  module V1
    module Admin
      class PostsController < ApplicationController
        before_action :authenticate_admin!

        def index
          posts = case params[:status]
          when "draft" then Post.drafts
          when "published" then Post.published
          else Post.order(created_at: :desc)
          end

          render json: { posts: posts.map { |post| serialize_post(post) } }
        end

        private

        def serialize_post(post)
          {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            body_markdown: post.body_markdown,
            cover_image_url: post.cover_image_url,
            published: post.published,
            published_at: post.published_at,
            tags: post.tags || [],
            reading_time_minutes: post.reading_time_minutes
          }
        end
      end
    end
  end
end
