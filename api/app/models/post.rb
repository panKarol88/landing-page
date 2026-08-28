class Post < ApplicationRecord
  has_one_attached :cover_image

  validates :title, presence: true
  validates :body_markdown, presence: true
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, on: :create
  before_save :sync_published_at

  scope :published, -> { where(published: true).where.not(published_at: nil).order(published_at: :desc) }
  scope :drafts, -> { where(published: false).order(created_at: :desc) }
  scope :by_tag, ->(tag) { where("? = ANY(tags)", tag.to_s.downcase) }

  def reading_time_minutes
    [ (body_markdown.to_s.scan(/\S+/).length / 200.0).ceil, 1 ].max
  end

  private

  def generate_slug
    return if slug.present?

    base = title.to_s.parameterize.presence || "post"
    candidate = base
    suffix = 2
    while Post.where.not(id: id).exists?(slug: candidate)
      candidate = "#{base}-#{suffix}"
      suffix += 1
    end
    self.slug = candidate
  end

  def sync_published_at
    self.published_at = if published?
      published_at || Time.current
    end
  end
end
