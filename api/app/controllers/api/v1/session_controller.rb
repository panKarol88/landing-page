module Api
  module V1
    class SessionController < ApplicationController
      rate_limit to: 10, within: 3.minutes, only: :create,
        with: -> { render json: { error: "Too many login attempts" }, status: :too_many_requests }

      def create
        password = params.require(:password).to_s
        expected = ENV.fetch("ADMIN_PASSWORD", "")
        valid = expected.present? &&
          ActiveSupport::SecurityUtils.secure_compare(Digest::SHA256.hexdigest(password), Digest::SHA256.hexdigest(expected))
        return render json: { error: "Invalid password" }, status: :unauthorized unless valid

        payload = { admin: true, exp: 7.days.from_now.to_i }
        render json: { token: JWT.encode(payload, ENV.fetch("JWT_SECRET", "development-jwt-secret"), "HS256") }
      end
    end
  end
end
