/// <reference types="../node_modules/@types/chrome" />


export function getCookies(): Promise<chrome.cookies.Cookie[]>{
    return new Promise((resolve, reject)=> {
        if (!chrome || !chrome.cookies){
            reject("Chrome extension API not present, cannot fetch cookies.")
        }
        chrome.cookies.getAll({"url": "https://www.gradescope.com"}, cookies => {
            resolve(cookies);
        });
    })
}

