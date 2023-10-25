-- This is an empty migration.

-- manually added line to create index on md5 value of the content.
-- this will enable dong exact match search without the bloat a regular index would have.

create index "Content_desktopHtml_md5_idx"
    on "Content" (md5("desktopHtml"));