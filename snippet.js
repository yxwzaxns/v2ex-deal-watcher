const WatchUrl = 'https://v2ex.com/go/all4all?p=1'
const WatchKeywords = ['网易','88']
const LoopTaskTime = 300 // 间隔多少秒查询一次

async function sendNotice(text){
    return fetch('https://v2ex-local-watcher.com:3344/point?t='+encodeURIComponent(text),{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

async function doTask(){
    let htmlText
    try {
        const resp = await fetch(WatchUrl)
        htmlText = await resp.text()
    } catch (error) {
        console.log('get url error:', error.message || error)
    }

    const titles = []
    const parser = new DOMParser()
    const htmlDoc = parser.parseFromString(htmlText, "text/html");
    htmlDoc.querySelectorAll('.item_title a').forEach(e=>titles.push({
        title: e.textContent,
        id: e.href
    }))
    const list = titles.filter(e => WatchKeywords.some(key=> e.title.includes(key)))
    if(!list.length){
        console.log('暂无结果')
    }else{
        list.map(e=>{
            console.log('发送内容：',e)
            sendNotice(JSON.stringify(e)).catch(console.log)
        })
    }
}

let idx = 1

async function main(){
    console.log(`${new Date()} | 开始检查页面数据: 第${idx}轮`)
    doTask()
    idx++
    setTimeout(main, LoopTaskTime * 1000)
}

main()
