<?php
/* Auto-login to MySQL with no password (DEV ONLY) */
$cfg['Servers'][1]['auth_type'] = 'config';
$cfg['Servers'][1]['host'] = 'mysql';
$cfg['Servers'][1]['user'] = 'root';
$cfg['Servers'][1]['password'] = '';
$cfg['Servers'][1]['AllowNoPassword'] = true;
$cfg['AllowArbitraryServer'] = false;
?>



