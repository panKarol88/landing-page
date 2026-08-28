module Api
  module V1
    class UploadsController < ApplicationController
      before_action :authenticate_admin!

      MAX_SIZE = 5.megabytes

      def create
        file = params[:file]
        return render json: { error: "Image file is required" }, status: :unprocessable_entity unless file
        return render json: { error: "File is too large (maximum 5MB)" }, status: :unprocessable_entity if file.size > MAX_SIZE

        content_type = sniff_content_type(file.tempfile)
        return render json: { error: "File must be an image" }, status: :unprocessable_entity unless content_type

        blob = ActiveStorage::Blob.create_and_upload!(
          io: file.tempfile,
          filename: file.original_filename,
          content_type: content_type
        )
        render json: { url: rails_blob_url(blob, host: request.base_url) }, status: :created
      end

      private

      def sniff_content_type(tempfile)
        header = tempfile.read(16)
        tempfile.rewind

        return "image/png" if header.start_with?("\x89PNG\r\n\x1A\n".b)
        return "image/jpeg" if header.start_with?("\xFF\xD8\xFF".b)
        return "image/gif" if header.start_with?("GIF87a", "GIF89a")
        return "image/webp" if header.start_with?("RIFF".b) && header.byteslice(8, 4) == "WEBP"

        nil
      end
    end
  end
end
