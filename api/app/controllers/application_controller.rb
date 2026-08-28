class ApplicationController < ActionController::API
  include AdminAuthentication

  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: "Not found" }, status: :not_found
  end

  rescue_from ActionController::ParameterMissing do |error|
    render json: { error: error.message }, status: :bad_request
  end

  rescue_from ActiveRecord::RecordInvalid do |error|
    render json: { errors: error.record.errors.to_hash }, status: :unprocessable_entity
  end

  private

  def render_validation_errors(record)
    render json: { errors: record.errors.to_hash }, status: :unprocessable_entity
  end
end
