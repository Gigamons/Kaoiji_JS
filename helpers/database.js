// This'll create the DefaultDatabase.
const common = require('../common');
const mysql = common.MySQLManager;

const createDatabase = async () => {
  await mysql.query(`
  CREATE TABLE \`banchotokens\` (
    \`userid\` int(11) NOT NULL,
    \`token\` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL
  ); 
  CREATE TABLE \`leaderboard\` (
    \`id\` int(11) NOT NULL,
    \`rankedscore_std\` int(11) NOT NULL DEFAULT '0',
    \`rankedscore_taiko\` int(11) NOT NULL DEFAULT '0',
    \`rankedscore_ctb\` int(11) NOT NULL DEFAULT '0',
    \`rankedscore_mania\` int(11) NOT NULL DEFAULT '0',
    \`totalscore_std\` int(11) NOT NULL DEFAULT '0',
    \`totalcore_taiko\` int(11) NOT NULL DEFAULT '0',
    \`totalscore_ctb\` int(11) NOT NULL DEFAULT '0',
    \`totalscore_mania\` int(11) NOT NULL DEFAULT '0',
    \`count_300_std\` int(11) NOT NULL DEFAULT '0',
    \`count_300_taiko\` int(11) NOT NULL DEFAULT '0',
    \`count_300_ctb\` int(11) NOT NULL DEFAULT '0',
    \`count_300_mania\` int(11) NOT NULL DEFAULT '0',
    \`count_100_std\` int(11) NOT NULL DEFAULT '0',
    \`count_100_taiko\` int(11) NOT NULL DEFAULT '0',
    \`count_100_ctb\` int(11) NOT NULL DEFAULT '0',
    \`count_100_mania\` int(11) NOT NULL DEFAULT '0',
    \`count_50_std\` int(11) NOT NULL DEFAULT '0',
    \`count_50_taiko\` int(11) NOT NULL DEFAULT '0',
    \`count_50_ctb\` int(11) NOT NULL DEFAULT '0',
    \`count_50_mania\` int(11) NOT NULL DEFAULT '0',
    \`count_miss_std\` int(11) NOT NULL DEFAULT '0',
    \`count_miss_taiko\` int(11) NOT NULL DEFAULT '0',
    \`count_miss_ctb\` int(11) NOT NULL DEFAULT '0',
    \`count_miss_mania\` int(11) NOT NULL DEFAULT '0',
    \`pp_std\` double NOT NULL DEFAULT '0',
    \`pp_taiko\` double NOT NULL DEFAULT '0',
    \`pp_ctb\` double NOT NULL DEFAULT '0',
    \`pp_mania\` double NOT NULL DEFAULT '0'
  );
  INSERT INTO \`leaderboard\` (\`id\`, \`rankedscore_std\`, \`rankedscore_taiko\`, \`rankedscore_ctb\`, \`rankedscore_mania\`, \`totalscore_std\`, \`totalcore_taiko\`, \`totalscore_ctb\`, \`totalscore_mania\`, \`count_300_std\`, \`count_300_taiko\`, \`count_300_ctb\`, \`count_300_mania\`, \`count_100_std\`, \`count_100_taiko\`, \`count_100_ctb\`, \`count_100_mania\`, \`count_50_std\`, \`count_50_taiko\`, \`count_50_ctb\`, \`count_50_mania\`, \`count_miss_std\`, \`count_miss_taiko\`, \`count_miss_ctb\`, \`count_miss_mania\`, \`pp_std\`, \`pp_taiko\`, \`pp_ctb\`, \`pp_mania\`) VALUES
  (1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

  CREATE TABLE \`users\` (
    \`id\` int(11) NOT NULL,
    \`username\` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
    \`username_safe\` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
    \`email\` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
    \`password\` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
    \`previleges\` int(11) NOT NULL DEFAULT '0'
  );

  INSERT INTO \`users\` (\`id\`, \`username\`, \`username_safe\`, \`email\`, \`password\`, \`previleges\`) VALUES
  (1, 'GigaBot', 'gigabot', 'bot@gigamons.de', '', 524284);

  CREATE TABLE \`users_status\` (
    \`id\` int(11) NOT NULL,
    \`country\` int(11) NOT NULL DEFAULT '0',
    \`lat\` double NOT NULL DEFAULT '0',
    \`lon\` double NOT NULL DEFAULT '0',
    \`banned\` tinyint(4) NOT NULL DEFAULT '0',
    \`banned_until\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`banned_reason\` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
    \`silenced\` tinyint(4) NOT NULL DEFAULT '0',
    \`silenced_until\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`silenced_reason\` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''
  );
  
  INSERT INTO \`users_status\` (\`id\`, \`country\`, \`lat\`, \`lon\`, \`banned\`, \`banned_until\`, \`banned_reason\`, \`silenced\`, \`silenced_until\`, \`silenced_reason\`) VALUES
  (1, 0, 0, 0, 0, '2018-04-22 17:25:00', '', 0, '2018-04-22 17:25:00', '');

  CREATE TABLE \`friends\` (
    \`userid\` int(11) NOT NULL,
    \`friendid\` int(11) NOT NULL
  );

  ALTER TABLE \`leaderboard\`
  ADD PRIMARY KEY (\`id\`);
  ALTER TABLE \`users\`
  ADD PRIMARY KEY (\`id\`);
  ALTER TABLE \`users_status\`
  ADD PRIMARY KEY (\`id\`);
  ALTER TABLE \`leaderboard\`
  MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
  ALTER TABLE \`users\`
  MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
  ALTER TABLE \`users_status\`
  MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
  commit;

  `)
}

createDatabase();
