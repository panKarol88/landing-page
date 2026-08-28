module Api
  module V1
    class UploadsController < ApplicationController
      before_action :authenticate_admin!

      MAX_SIZE = 5.megabytes

      def create
        file = params[:file]
        return render json: { error: "Image file is required" }, status: :unprocessable_entity unless file
        return render json: { error: "File must be an image" }, status: :unprocessable_entity unless file.content_type.to_s.start_with?("image/")
        return render json: { error: "File is too large (maximum 5MB)" }, status: :unprocessable_entity if file.size > MAX_SIZE

        blob = ActiveStorage::Blob.create_and_upload!(
          io: file.tempfile,
          filename: file.original_filename,
          content_type: file.content_type
        )
        render json: { url: rails_blob_url(blob, host: request.base_url) }, status: :created
      end
    end
  end
end
