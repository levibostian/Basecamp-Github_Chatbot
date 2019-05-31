import axios from 'axios'

export default async function message(lines_url: string, content: string) {
    try {
        await axios.post(lines_url, { content }, {
            headers: {
                'User-Agent': 'BaseCamp + GitHub ChatBot (thrymgjol@gmail.com)'
            }
        })
    } catch {
        // TODO retry??
    }
}