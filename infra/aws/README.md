## Debugging

Checking instance initialization logs

```bash
sudo vim /var/log/cloud-init-output.log
```

Impersonationg ec2 user
```bash
sudo su - ec2-user
```

Checking pm2 status

```bash
pm2 status
```

Restarting pm2

```bash
pm2 restart dougust-api
```

check pm2 logs
```bash
pm2 logs
```


checking result of invocation command
```bash
aws ssm list-commands \
--instance-id i-0288f2d03f602b25d \
--max-results 10 \
--query 'Commands[*].{CommandId:CommandId,Status:Status,Time:RequestedDateTime,Comment:Comment}' \
--output table
```

```bash
aws ssm get-command-invocation \
--command-id 4dbc599a-b8bf-4fe5-a1a2-6b0bd1e494df \
--instance-id i-0288f2d03f602b25d \
--output json
```

## Debugging nest in the instance

sudo systemctl start nginx
sudo systemctl enable nginx

## Running unit tests

Run `nx test infra` to execute the unit tests via [Jest](https://jestjs.io).
