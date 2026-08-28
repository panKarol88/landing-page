class CreatePosts < ActiveRecord::Migration[8.1]
  def change
    create_table :posts do |t|
      t.string :title, null: false
      t.string :slug, null: false
      t.text :excerpt
      t.text :body_markdown, null: false
      t.string :cover_image_url
      t.boolean :published, null: false, default: false
      t.datetime :published_at
      t.string :tags, array: true, null: false, default: []

      t.timestamps
    end
    add_index :posts, :slug, unique: true
    add_index :posts, :published
    add_index :posts, :tags, using: :gin
  end
end
