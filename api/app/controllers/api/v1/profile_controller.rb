module Api
  module V1
    class ProfileController < ApplicationController
      def show
        render json: YAML.load_file(Rails.root.join("config/profile.yml"), permitted_classes: [ Symbol ])
      end
    end
  end
end
