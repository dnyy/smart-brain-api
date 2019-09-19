BEGIN TRANSACTION;

INSERT INTO users (name, email, entries, joined ) values ('devvy', 'devvy@gmail.com', 5, '2019-01-01');
INSERT INTO login (hash, email) values ('$2a$10$g2yrxJMo2tEQvcqImuSQtObQW0rXAqkA3JidD5AZpTmyEP8Azvda.', 'devvy@gmail.com');

COMMIT;