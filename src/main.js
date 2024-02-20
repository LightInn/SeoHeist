const OpenAI = require('openai')
const {Article} = require('./Article')
const PocketBase = require('pocketbase/cjs')
const ProgressBar = require('console-progress-bar');


const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
    // apiKey: "xxxx"
});
const pb = new PocketBase('https://stickman-api.lightin.io');

// 1 - Open CSV file


// 2 - Read CSV file

// 3 - Parse CSV file


// 4 - fetch urls

// 5 - simplify urls

// use google keyword planner to get keywords

// lets start with a predefined list of keywords

const language = 'french'


var keywords = ["stick duel medieval wars"];


async function generateArticle(keyword) {

    const progressBar = new ProgressBar({ maxValue: 5 });


    // 6 - genereate articles

    progressBar.addValue(1);

// - write a short and simple title for an article avout #keywords

    const chatCompletion = await openai.chat.completions.create({
        messages: [{
            role: 'user',
            content: "write a short and simple title for an article about \"" + keyword + "\". The output should be in " + language
        }],
        model: 'gpt-3.5-turbo',
    });

    progressBar.addValue(1);



// - write a metadata description for an article named #title. keep it under 150 characters

    const chatCompletion2 = await openai.chat.completions.create({
        messages: [{
            role: 'user',
            content: "write a metadata description for an article named \"" + chatCompletion.choices[0].message.content + "\". keep it under 150 characters. The output should be in " + language
        }],
        model: 'gpt-3.5-turbo',
    });

    progressBar.addValue(1);

// - write an article about #title. subheadings should be in BBCode format. dont include the article title in the output


    const chatCompletion3 = await openai.chat.completions.create({
        messages: [{
            role: 'user',
            content: "write an article about \"" + chatCompletion.choices[0].message.content + "\" that take in count the metadescription : \"" + chatCompletion2 + "\". subheadings should be in BBCode format. dont include the article title in the output. The output should be in " + language
        }],
        model: 'gpt-4-turbo-preview',
    });


    progressBar.addValue(1);
// - generate image from #title

    // voir avec midjourney pour les images

// 7 - create Article with keywords, content, title, image, image-meta, meta-description. use keywords as slug and tags

    progressBar.addValue(1);

    return {
        title: chatCompletion.choices[0].message.content,
        metaDescription: chatCompletion2.choices[0].message.content,
        content: chatCompletion3.choices[0].message.content,
        keywords: keyword,
        slug: keyword,
        tags: keyword
    }
}

async function main() {


// 9 - repeat for all keywords
    for (let keyword of keywords) {


        var article = await generateArticle(keyword)

        console.log(article)




        // 8 - save article to pocketbase or Strapi
        // PocketBase

        // example create data
        const data = {
            "title": article.title,
            "content": article.content,
            "describe": article.metaDescription,
            "slug": article.slug,
            "keywords": article.keywords,
        };

        const record = await pb.collection('blog').create(data);


    }


}

main();








