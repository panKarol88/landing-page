require "test_helper"

class FeedControllerTest < ActionController::TestCase
  test "cdata escapes terminators" do
    assert_equal "<![CDATA[a]]]]><![CDATA[>b]]>", FeedController.new.send(:cdata, "a]]>b")
  end
end
