// ==UserScript==
// @name         WebChatGPT UserScript Version
// @namespace    https://www.reddit.com/user/JamesGriffing
// @version      0.1
// @description  Google Search for chatGPT
// @author       Frank Wang
// @match        https://chat.openai.com/chat*
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// @license MIT
// ==/UserScript==

(function () {
    "use strict";

    /**** This code is not optimized. This code was written by chatGPT, for chatGPT. *****/
    let prompt = 'Web search results:\n\n{web_results}\nCurrent date: {current_date}\n\nInstructions: Using the provided web search results, write a comprehensive reply to the given query. Make sure to cite results using [[number](URL)] notation after the reference. If the provided search results refer to multiple subjects with the same name, write separate answers for each subject.\nQuery: {query}\n\n reply in traditional Chinese.'
    let maxResult = 10

    // function to append text to textarea in chat
    function appendText(text) {
        let textarea = document.querySelector("textarea");
        let submitBtn = findSubmitBtn()
        console.log(submitBtn)
        textarea.value = text;
        // envoke the keydown event to send the message (use spacebar to send message)
        textarea.focus();

        //textarea.trigger("keydown", { key: " " });
        /*
        setTimeout(function () {
            if (textarea.value === "") {
                textarea.value = text;
            } else {

            }
        }, 250);
        */
        submitBtn.click();

    }

    function findSubmitBtn() {
        let btns = document.getElementsByTagName('button')
        for(let b of btns) {
            if(isSvgElement(b.firstChild)){
                return b
            }
        }
        alert('not find submit btn')
    }
    function isSvgElement(element) {
        return /^svg/i.test(element.tagName);
    }

    // function with timer to check 250 ms after text area has text added to see if the text area has been cleared, if so then add back the text
    function checkTextArea(text) {
        let textarea = document.querySelector("textarea");
        setTimeout(function () {
            if (textarea.value === "") {
                textarea.value = text;
            }
        }, 250);
    }

    function triggerGoogleSearch(query) {
        let s_btn = document.getElementById("gs_btn");
        s_btn.disable = true;
        s_btn.textContent = "Loading....."
        GM.xmlHttpRequest({
            method: 'GET',
            url: `https://ddg-webapp-aagd.vercel.app/search?q=${query}&max_results=${maxResult}`,
            onload: function(response) {
                if (response.status === 200) {

                    // Log the response
                    console.log(response.responseText);
                    let new_prompt = compileResult(JSON.parse(response.responseText), query)
                    console.log(new_prompt)
                    appendText(new_prompt)

                } else {
                    // Request failed
                    console.error('Request failed with status ' + response.status);
                    alert('request fail')
                }
                s_btn.disable = false;
                s_btn.textContent = "Search Google"

            },
            onerror: function(response) {
                // Request failed due to a network error or other issue
                console.error('Request failed: ' + response.statusText);
                alert('request fail')
            }
        })
    }

    function compileResult(queryResult, queryStr) {
        let counter = 1
        let web_result_str = ""
        let currentDate = new Date().toISOString().slice(0, 10)
        for(let result of queryResult) {
            web_result_str += `[${counter++}] "${result.body}"\nURL: ${result.href}\n\n`
        }
        let resultPrompt = prompt
        resultPrompt = resultPrompt.replace('{web_results}', web_result_str)
        resultPrompt = resultPrompt.replace('{current_date}', currentDate)
        resultPrompt = resultPrompt.replace('{query}', queryStr)
        return resultPrompt
    }

    // Build UI
    let form_dom = document.querySelector("form")
    let gs_div = document.createElement('div')
    gs_div.className= "flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]"

    let btn = document.createElement("div");
    btn.textContent = "Search Google"
    btn.setAttribute('id', 'gs_btn')
    gs_div.appendChild(btn);
    form_dom.firstChild.appendChild(gs_div);
    gs_div.addEventListener("click", function () {
        let textarea = document.querySelector("textarea")
        if(!textarea.value) {
            alert("no input")
            return
        }
        console.log(`Start search ${textarea.value}`)
        triggerGoogleSearch(textarea.value);
    });
})();
