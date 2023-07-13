-- This is an empty migration.

-- manually added line to create index on md5 values so we dont get error on value being too large
create unique index "AdvertisementSpot_webpageId_beforeText_afterText_key"
    on "AdvertisementSpot" ("webpageId", md5("beforeText"), md5("afterText"));