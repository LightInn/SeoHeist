const OpenAI = require('openai')


const language = 'french'

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
    // apiKey: "XXXXXX"
});


// 1 - Open CSV file


// 2 - Read CSV file

// 3 - Parse CSV file


// 4 - fetch urls

// 5 - simplify urls

// use google keyword planner to get keywords

// lets start with a predefined list of keywords

var keywords = ["site maquillage professionnel"];


async function generateArticle(keyword) {
    // 6 - genereate articles

// - write a short and simple title for an article avout #keywords

    const chatCompletion = await openai.chat.completions.create({
        messages: [{
            role: 'user',
            content: "write a short and simple title for an article about \"" + keyword + "\". The output should be in " + language
        }],
        model: 'gpt-3.5-turbo',
    });


// - write a metadata description for an article named #title. keep it under 150 characters

    const chatCompletion2 = await openai.chat.completions.create({
        messages: [{
            role: 'user',
            content: "write a metadata description for an article named \"" + chatCompletion.choices[0].message.content + "\". keep it under 150 characters. The output should be in " + language
        }],
        model: 'gpt-3.5-turbo',
    });


// - write an article about #title. subheadings should be in BBCode format. dont include the article title in the output


    const chatCompletion3 = await openai.chat.completions.create({
        messages: [{
            role: 'user',
            content: "write an article about \"" + chatCompletion.choices[0].message.content + "\" that take in count the metadescription : \""+ chatCompletion2 +"\". subheadings should be in BBCode format. dont include the article title in the output. The output should be in " + language
        }],
        model: 'gpt-4-turbo-preview',
    });


// - generate image from #title

    // voir avec midjourney pour les images

// 7 - create Article with keywords, content, title, image, image-meta, meta-description. use keywords as slug and tags

    const article = {
        title: chatCompletion.choices[0].message.content,
        metaDescription: chatCompletion2.choices[0].message.content,
        content: chatCompletion3.choices[0].message.content,
        keywords: keyword,
        slug: keyword,
        tags: keyword
    }

// 8 - write articles with API

    console.log(article)


}

function main() {


// 9 - repeat for all keywords
    for (let keyword of keywords) {

        generateArticle(keyword)


    }


}

main();








