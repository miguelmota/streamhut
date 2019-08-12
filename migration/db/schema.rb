# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_04_13_064822) do

  create_table "stream_logs", force: :cascade do |t|
    t.binary "stream_handle", null: false
    t.binary "data", null: false
    t.datetime "created_at", null: false
    t.index ["created_at"], name: "index_stream_logs_on_created_at"
    t.index ["data"], name: "index_stream_logs_on_data"
    t.index ["stream_handle"], name: "index_stream_logs_on_stream_handle"
  end

  create_table "stream_messages", force: :cascade do |t|
    t.binary "stream_handle", null: false
    t.binary "message", null: false
    t.binary "mime", null: false
    t.datetime "created_at", null: false
    t.index ["created_at"], name: "index_stream_messages_on_created_at"
    t.index ["mime"], name: "index_stream_messages_on_mime"
    t.index ["stream_handle"], name: "index_stream_messages_on_stream_handle"
    t.index [nil], name: "index_stream_messages_on_data"
  end

end
