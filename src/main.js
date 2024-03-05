const OpenAI = require('openai')
const {Article} = require('./Article')
const PocketBase = require('pocketbase/cjs')
const ProgressBar = require('console-progress-bar');


const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
    // apiKey: "****"
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

var keywords = ["stick", "duel", "medieval", "wars", "french", "drawing", "digital", "animation", "game",
    "video", "2d", "3d", "stickman", "stickfigure", "nintendo", "youtube", "children", "kids", "funny", "fight", "ninja", "robot"];

var usedKeywords = [];

// function to pick 3 random keywords from the list, keywords should not be already picked together
function pick3RandomKeywords(keywords) {
    var result = ["stickman"];
    var notFound = true;

    while (notFound) {
        // pick 2 random keywords
        var random1 = Math.floor(Math.random() * keywords.length);
        var random2 = Math.floor(Math.random() * keywords.length);

        temporaryResult = [keywords[random1], keywords[random2]];

        // check if the 3 keywords are not already picked together
        if (!usedKeywords.includes(temporaryResult)) {
            result = result.concat(temporaryResult);
            usedKeywords.push(temporaryResult);
            notFound = false;
        }
    }
    return result;
}


async function generateArticle(keyword) {

    const progressBar = new ProgressBar({maxValue: 5});


    // 6 - genereate articles

    progressBar.addValue(1);

// - write a short and simple title for an article avout #keywords

    const chatCompletion = await openai.chat.completions.create({
        messages: [{
            role: 'user',
            content: "write a short and simple title for an article about \"" + keyword + "\". The output should be in " + language
        }], model: 'gpt-3.5-turbo',
    });

    console.log(chatCompletion.choices[0].message.content);

    progressBar.addValue(1);


// - write a metadata description for an article named #title. keep it under 150 characters

    const chatCompletion2 = await openai.chat.completions.create({
        messages: [{
            role: 'user',
            content: "write a metadata description for an article named \"" + chatCompletion.choices[0].message.content + "\". keep it under 150 characters. The output should be in " + language
        }], model: 'gpt-3.5-turbo',
    });

    progressBar.addValue(1);

// - write an article about #title. subheadings should be in BBCode format. dont include the article title in the output


    const chatCompletion3 = await openai.chat.completions.create({
        messages: [{
            role: 'user',
            content: "write an article about \"" + chatCompletion.choices[0].message.content + "\" that take in count the metadescription : \"" + chatCompletion2 + "\". the article should be in html rich text format. dont include the article title in the output. dont include the markdown code backtick, output the html directly. dont include the html doctype or the head section. The output should be in " + language
        }], model: 'gpt-4-turbo-preview',
    });


    progressBar.addValue(1);
// - generate image from #title

    // voir avec midjourney pour les images

    const response = await openai.images.generate({
        // model: "dall-e-3",
        model: "dall-e-2",
        // title = Image
        prompt: chatCompletion.choices[0].message.content,
        n: 1, // size: "1792x1024",
        size: "256x256",
    });

    image_url = response.data[0].url;

// 7 - create Article with keywords, content, title, image, image-meta, meta-description. use keywords as slug and tags

    progressBar.addValue(1);

    return {
        title: chatCompletion.choices[0].message.content,
        metaDescription: chatCompletion2.choices[0].message.content,
        content: chatCompletion3.choices[0].message.content,
        image: image_url
    }
}

async function main() {

    //pick random keywords
    var keywordsChoosed = pick3RandomKeywords(keywords);

    console.log(keywordsChoosed);

    // concatene keywords
    var keyword = keywordsChoosed.join(' ');

    // 7 - generate article
    var article = await generateArticle(keyword)

    // 8 - save article to pocketbase or Strapi
    // PocketBase

    const formData = new FormData();
    formData.append('title', article.title);
    formData.append('describe', article.metaDescription);
    formData.append('content', article.content);
    formData.append('url', article.title.replace(/[^a-zA-Z0-9]/g, '').replace(/\s+/g, '-').toLowerCase());
    formData.append('image', article.image);
    formData.append('tags', JSON.stringify(keywordsChoosed));
    formData.append('publishedAt', new Date().toISOString());

    const record = await pb.collection('blog').create(formData);
}

main();








