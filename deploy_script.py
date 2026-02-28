import paramiko
import os

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("157.230.178.118", username="root", password="class1557#Priwcut")

sftp = ssh.open_sftp()

local_dist = "f:/workana_work/JohnClass/vantage-web/dist"
remote_base = "/var/www/vantage"

stdin, stdout, stderr = ssh.exec_command("find /var/www/vantage -maxdepth 1 -not -name 'api' -not -name 'uploads' -not -path '/var/www/vantage' -exec rm -rf {} +")
stdout.read()

for root, dirs, files in os.walk(local_dist):
    rel = os.path.relpath(root, local_dist).replace("\\", "/")
    if rel == ".":
        remote_dir = remote_base
    else:
        remote_dir = remote_base + "/" + rel
    try:
        sftp.mkdir(remote_dir)
    except:
        pass
    for f in files:
        local_path = os.path.join(root, f)
        remote_path = remote_dir + "/" + f
        sftp.put(local_path, remote_path)
        print(f"Uploaded: {remote_path}")

sftp.close()
ssh.close()
print("Deploy complete!")
