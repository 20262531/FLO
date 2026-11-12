CREATE TRIGGER tasks_parent_open BEFORE INSERT ON tasks
WHEN json_extract(NEW.data,'$.parentId') IS NOT NULL AND json_extract(NEW.data,'$.parentId') <> ''
BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM tasks p WHERE p.id=json_extract(NEW.data,'$.parentId') AND json_extract(p.data,'$.status') NOT IN ('closed','cancelled')) THEN RAISE(ABORT,'Parent task is closed or missing') END;
END;
--> statement-breakpoint
CREATE TRIGGER tasks_close_guard BEFORE UPDATE ON tasks
WHEN json_extract(NEW.data,'$.status') IN ('closed','cancelled')
BEGIN
 SELECT CASE WHEN EXISTS(SELECT 1 FROM tasks c WHERE json_extract(c.data,'$.parentId')=NEW.id AND json_extract(c.data,'$.status') NOT IN ('closed','cancelled')) THEN RAISE(ABORT,'Open child tasks remain') END;
 SELECT CASE WHEN json_extract(NEW.data,'$.status')='closed' AND EXISTS(SELECT 1 FROM json_each(NEW.data,'$.checklist') WHERE json_extract(value,'$.done') IS NOT 1) THEN RAISE(ABORT,'Checklist is incomplete') END;
END;
