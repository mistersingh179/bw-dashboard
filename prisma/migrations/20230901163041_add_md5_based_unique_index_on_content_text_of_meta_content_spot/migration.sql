-- This is an empty migration.

-- manually added line to create index on md5 values so we dont get error on value being too large
create unique index "MetaContentSpot_webpageId_contentText_key"
    on "MetaContentSpot" ("webpageId", md5("contentText"));