const cheerioReq = require("cheerio-req");
//https://www.goodfirms.co/accounting-software/

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require("fs");
const asyncLoop = require('node-async-loop');

async function getUrls(){
    try{

        let initial = await axios.get('https://www.goodfirms.co/directories/software/')
        const $1 = cheerio.load(initial.data)
        let arr1 = $1('.result-section-output li a');
        asyncLoop(arr1, async function (item1, next1){
            try{
                let a = await axios.get('https://www.goodfirms.co'+item1.value.attribs.href)
                const $2 = cheerio.load(a.data)
                
                let arr2 = $2('.software-entity .firms-r a'),
                arr2Name = $2('.software-entity .firms-l .c_name_head'),
                i = 0;
                // console.log(arr2Name[0].children[0].data)
                asyncLoop(arr2, async function (item2, next2){
                    // console.log(item2.value)
                    try{
                        if(item2.value.attribs){
                            console.log(item2.value.attribs.href);
                            let link = item2.value.attribs.href;
                            let a = setTimeout(()=>{
                                next2()
                                return;
                            },10000)
                            cheerioReq(link, (err, $) => {
                                clearTimeout(a)
                                if(err){
                                    console.log(err," error for ", link)
                                    next2()
                                    return;
                                }else{
                                    if($&&$.html()){
                                        let all = $.html(),
                                        index = all.indexOf('mailto:'),
                                        fullMail = ''
                                        if(index>-1){
                                            index += 7;
                                            while(all[index]!='"'){
                                                if(all[index++])
                                                    fullMail += all[index++];
                                            }
                                        }
                                        console.log(fullMail,' is mail from ', link)
                                        var text = '{\n "email":"'+fullMail + '",\n "companyName":"' +arr2Name[i]?.children[0]?.data + '",\n "from":"'+item1.value.attribs.href+'",\n "url":"'+link+'"\n},\n'
                                        i++;
                                        fs.appendFile('data.json', text, function (err) {
                                            if (err) throw err;
                                            console.log('Saved!');
                                            next2()
                                            return;
                                        });
                                    }else{
                                        var text = '{\n "err":"Page did not load",\n "from":"'+item1.value.attribs.href+'",\n "url":"'+link+'"\n},\n'
                                        i++;
                                        fs.appendFile('data.json', text, function (err) {
                                            if (err) throw err;
                                            console.log('Saved!');
                                            next2()
                                            return;
                                        });
                                    }
                                }
                            });
                        }else {next2(); return;}
                    }catch(err){
                        var text = '{\n "err":'+JSON.stringify(err)+',\n "from":"'+item1.value.attribs.href+'",\n "url":"'+link+'"\n},\n'
                        i++;
                        fs.appendFile('data.json', text, function (err) {
                            if (err) throw err;
                            console.log('Saved!');
                            next2()
                            return;
                        });
                    }
                    // next2()
                },function(err){
                    if (err)
                    {
                        console.error('Error: ' + err.message);
                        return;
                    }
                    console.log('Finished! for ',item1.value.attribs.href);
                    next1()
                })
            }catch(err2){
                console.log(err2)
            }
        },function(err){
            if (err)
            {
                console.error('Error: ' + err.message);
                return;
            }
         
            console.log('Finished! totally');
        })
    }catch(err1){
        console.log(err1)
    }

}

getUrls()
 
// cheerioReq("https://www.goodfirms.co/accounting-software/", (err, $) => {
//     console.log($.html())
//     // let all = $.html(),
//     // index = all.indexOf('mailto:'),
//     // fullMail = ''
//     // if(index>-1){
//     //     index += 7;
//     //     while(all[index]!='"'){
//     //         fullMail += all[index++];
//     //     }
//     // }
//     // console.log(fullMail)
// });
// cheerioReq("https://www.banana.ch/en/company_contacts", (err, $) => {
//     let all = $.html(),
//     index = all.indexOf('mailto:'),
//     fullMail = ''
//     if(index>-1){
//         index += 7;
//         while(all[index]!='"'){
//             fullMail += all[index++];
//         }
//     }
//     console.log(fullMail)
// });