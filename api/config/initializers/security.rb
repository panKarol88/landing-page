module Api
  module Security
    def self.jwt_secret
      ENV.fetch("JWT_SECRET") do
        raise "JWT_SECRET must be configured before using admin authentication"
      end
    end
  end
end
