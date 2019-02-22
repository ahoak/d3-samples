
const DEFAULT_CLASSNAME = 'annotated-no-color'
const HIGHLIGHT_COLOR = 'rgba(255,255,0,0.5)'


export const fetchApi = async (endpoint: string) => {
    return await fetch(endpoint, {
        headers: {
            'content-type': 'application/json'
        }
    })
        .then((response: any) => response.json())
}

export const getContent = async (articleTitle: string) => {
    const WIKI_API = `https://en.wikipedia.org/w/api.php?action=query`
    const CHAR_LIMIT = 5000
    const htmlEndpoint = `${WIKI_API}&prop=extracts&titles=${articleTitle}&format=json&origin=*`
    const linkEndpoint = `${WIKI_API}&prop=links&pllimit=max&titles=${articleTitle}&format=json&origin=*`
    const imagesEndpoint = `${WIKI_API}&prop=images&titles=${articleTitle}&format=json&origin=*`
    const data = await Promise.all([
        fetchApi(htmlEndpoint),
        fetchApi(linkEndpoint),
        fetchApi(imagesEndpoint)
    ]).then((result) => {
        const htmlContent = result[0]
        const linkContent = result[1]
        const imageContent = result[2]
        const imageList = imageContent.query.pages
        const pages = htmlContent.query.pages
        const linkList = linkContent.query.pages
        const pagesKeys = Object.keys(pages)
        return pagesKeys.map((pageid: string) => {
            const title = pages[pageid].title
            let content = pages[pageid].extract
            content = content.substring(0, CHAR_LIMIT) // take a sample
            content = content + '...'
            const links = linkList[pageid].links
            const images = imageList[pageid].images
            const linksmapped = links.map((o: any) => o.title)
            const imagesmapped = images.map((o: any) => o.title)
            // find all links in the content substring
            const currentLinks = linksmapped.reduce((accum: string[], curr: string) => {
                if (content.indexOf(curr) >= 0) {
                    accum.push(curr)
                }
                return accum
            }, [])
            // find related images to links to lookup later
            const relatedImages = imagesmapped.reduce((accum: any[], curr: string) => {
                currentLinks.forEach((link: string) => {
                    if (curr.indexOf(link) >= 0) {
                        const endpoint = `${WIKI_API}&titles=${curr}&prop=imageinfo&iiprop=url&format=json&origin=*`
                        accum[link] = endpoint
                    }
                })
                return accum
            }, {})
            const htmlMapped = { title, content, links: currentLinks, images: relatedImages }
            return htmlMapped
        })
    })
    return data
}


export const parseContent = (content: string[], links: any) =>{
    return content.reduce((accumulator: any, sentence: any, index: number) => {
        sentence = sentence + '. ' // add period and space
        const matches = links.reduce((accum: string[], curr: string) => {
            if (sentence.indexOf(curr) >= 0) {
                accum.push(curr)
            }
            return accum
        }, [])
        if (matches.length > 0) {
            const mapped = matches.reduce((accum: any[], match: string) => {
                const index = sentence.indexOf(match)
                const endIndex = index + match.length + 1
                const matchRef = { match, start: index, end: endIndex }
                accum.push(matchRef)
                return accum
            }, [])
            const sortedIndexes = mapped.sort((a: any, b: any) => (a.start > b.start) ? 1 : ((b.start > a.start) ? -1 : 0))
            const wordsArray: any[] = []
            sortedIndexes.reduce((accum: string, match: any, i: number) => {
                const target = match.match
                const index = accum.indexOf(target)
                const before = accum.slice(0, index)
                const beforeObject = { classname: DEFAULT_CLASSNAME, text: before, id: index + i }
                const matchObject = { classname: HIGHLIGHT_COLOR, text: target, id: index + i }
                const endIndex = index + target.length + 1
                const end = accum.slice(endIndex)
                accum = end
                wordsArray.push(beforeObject)
                wordsArray.push(matchObject)
                if (i === matches.length - 1) {
                    wordsArray.push({ classname: DEFAULT_CLASSNAME, text: end, id: index + i })
                }
                return accum
            }, sentence)
            accumulator[index] = wordsArray
        } else {
            accumulator[index] = [{ text: sentence, classname: DEFAULT_CLASSNAME, id: -1 }]
        }
        return accumulator
    }, {})
}

