module AdminAuthentication
  extend ActiveSupport::Concern

  private

  def authenticate_admin!
    return if current_admin?

    render json: { error: "Authentication required" }, status: :unauthorized
  end

  def current_admin?
    token = request.headers["Authorization"].to_s.delete_prefix("Bearer ").strip
    return false if token.blank?

    payload, = JWT.decode(token, jwt_secret, true, { algorithm: "HS256" })
    payload["admin"] == true && payload["exp"].to_i > Time.current.to_i
  rescue JWT::DecodeError, JWT::ExpiredSignature, JWT::VerificationError
    false
  end

  def jwt_secret
    ENV.fetch("JWT_SECRET", "development-jwt-secret")
  end
end
