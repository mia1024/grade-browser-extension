import $ from "jquery";

export async function makeRequest(endpoint:string){
    let response = await $.ajax(
        "https://www.gradescope.com"+endpoint,
    );
    let parser = new DOMParser;
    return $(parser.parseFromString(response, "text/html"));
}

export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;
export type DOM=Awaited<ReturnType<typeof makeRequest>>
