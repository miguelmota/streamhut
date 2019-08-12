class StreamMessages < ActiveRecord::Migration[5.2]
  def change
    create_table :stream_messages, force: :cascade do |t|
      t.binary :stream_handle, null: false
      t.binary :message, null: false
      t.binary :mime, null: false
      t.datetime :created_at, null: false, default: -> { 'CURRENT_TIMESTAMP' }
      t.index [:stream_handle], name: :index_stream_messages_on_stream_handle
      t.index [:mime], name: :index_stream_messages_on_mime
      t.index [:data], name: :index_stream_messages_on_data
      t.index [:created_at], name: :index_stream_messages_on_created_at
    end
  end
end
