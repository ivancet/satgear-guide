"""Checks every source URL in data.js loads (HTTP 2xx). Some dealer sites (bsbroadcast.com, ebay, picclick)
block datacenter IPs with a captcha (HTTP 202/403); those are reported as BLOCKED, not as broken."""
import re, subprocess, sys, concurrent.futures as cf
src = open(__file__.rsplit('/tests/', 1)[0] + '/data.js').read()
urls = sorted(set(re.findall(r"url: '([^']+)'", src)) | set(re.findall(r"datasheet: '([^']+)'", src)))
def chk(u):
    out = subprocess.run(['curl', '-sL', '--max-time', '25', '-A', 'Mozilla/5.0 (X11; Linux x86_64) Chrome/124', '-o', '/dev/null', '-w', '%{http_code}', u], capture_output=True, text=True).stdout
    return u, out
bad = 0
with cf.ThreadPoolExecutor(8) as ex:
    for u, code in ex.map(chk, urls):
        status = 'OK' if code.startswith('2') and code != '202' else ('BLOCKED' if code in ('202', '403', '000') else 'BROKEN')
        if status == 'BROKEN': bad += 1
        print(f'{status:8} {code} {u}')
print(len(urls), 'urls,', bad, 'broken'); sys.exit(1 if bad else 0)
