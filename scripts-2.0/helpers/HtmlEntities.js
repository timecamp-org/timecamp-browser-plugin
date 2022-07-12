const decodeHtmlEntities = (str) => {
        return str
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, "\"")
            .replace(/&apos;/g, "\'")
            ;
}

export default decodeHtmlEntities;