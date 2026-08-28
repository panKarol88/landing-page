module Api
  module V1
    class TagsController < ApplicationController
      def index
        counts = Post.published.where.not(tags: []).pluck(:tags).flatten.tally
        tags = counts.sort_by { |tag,| tag }.map { |tag, count| { tag: tag, count: count } }
        render json: { tags: tags }
      end
    end
  end
end
