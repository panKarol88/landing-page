Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :posts, param: :slug, only: %i[index show create update destroy]
      namespace :admin do
        resources :posts, param: :slug, only: :index
      end
      post "uploads", to: "uploads#create"
      get "tags", to: "tags#index"
      get "profile", to: "profile#show"
      post "session", to: "session#create"
    end
  end

  get "feed.xml", to: "feed#show", defaults: { format: :xml }
end
