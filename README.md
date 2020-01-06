# Brook Panel

brook管理WEB面板：  
1. 用户管理
2. 限流量
3. 限时间
4. 限速

## 一键安装

``` bash
bash -c "curl -fsSL https://raw.githubusercontent.com/inu1255/brookpanel/master/install.sh"
```

## 手动安装

``` bash
# 下载程序
wget -N --no-check-certificate https://github.com/inu1255/brookpanel/releases/download/1.0/brookpanel.tar.gz
tar -xzf brookpanel.tar.gz
# 启动  
# 	--key 指定产品密钥, 免费密钥 ZnJlZS1icm9va2lyZA==
# 	--port 指定端口，默认 9182
./brookpanel start --key ZnJlZS1icm9va2lyZA==
```

## 配置文件

``` json
// .config.json
{
  // 产品密钥
  "key": "YnJvb2tpcmQ6Ly9zc3IuaW51MTI1NS5jbi9hcGk=",
  // WEB管理端密码
  "token": "16ddfwutxgjte1twm86kqk9z671akhcyde76ot9",
  // WEB管理端端口
  "port": 9182
}
```