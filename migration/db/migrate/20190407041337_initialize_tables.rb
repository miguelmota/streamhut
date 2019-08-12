class InitializeTables < ActiveRecord::Migration[5.2]
  def change
    create_table :stream_logs, force: :cascade do |t|
      t.binary :stream_handle, null: false
      t.binary :data, null: false
      t.datetime :created_at, null: false, default: -> { 'CURRENT_TIMESTAMP' }
      t.index [:stream_handle], name: :index_stream_logs_on_stream_handle
      t.index [:data], name: :index_stream_logs_on_data
      t.index [:created_at], name: :index_stream_logs_on_created_at
    end
  end
end
