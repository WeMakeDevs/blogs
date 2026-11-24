---
title: "Voice In, Voice Out: An Indian-Language Support Desk on Sarvam AI"
description: What it takes to build a support desk that listens in Hindi and answers in Hindi, the five API calls behind one recording, the real timings, and the two things that broke.
datePublished: 2026-11-23
author: kunal-kushwaha
tags: [technical, sarvam, ai, hackathon]
---

A support flow starts with a text box, and that box decides the language before anyone has said anything. What gets typed is what the classifier reads, what the classifier reads becomes the ticket a human picks up, and a customer who would rather describe the problem out loud in Hindi or Kannada has to turn it into something a keyboard can produce first. Someone whose electricity bill has doubled already has the sentence ready. Typing it is the part they do not want to do.

Speech models that cover Indian languages end to end move that decision somewhere better. If the complaint arrives as speech, gets understood in the language it was spoken in, and goes back out as speech in that same language, then English becomes something you generate for the agent rather than something you demand from the customer. Sarvam AI builds that set of models, and it is one of the three sponsor tools at [Festive Hacks](https://www.wemakedevs.org/hackathons/festivehacks) on 25 November, so this is a good week to find out what building on it is actually like.

I built a small support desk on the Sarvam APIs and put real complaints through it. The calls, the numbers and the two things that broke are all from that app.

## The app: Shikayat Desk

Shikayat Desk, shikayat being the Hindi word for complaint, is a support desk for a fictional electricity provider. A customer presses record, says what is wrong in whatever language they speak, and gets a spoken answer back in the same language. The panel on the right carries the English version for the human agent, a parsed ticket, and the time each API call took.

![Shikayat Desk before anyone has said anything](images/an-indian-language-voice-support-desk-on-sarvam-ai/shikayat-desk.jpg)

There is no language dropdown anywhere on that screen, which is the entire point. The only input is a record button and a timer that stops itself at 25 seconds, because the synchronous speech-to-text endpoint rejects audio longer than 30.

The desk is running at [shikayat-desk.onrender.com](https://shikayat-desk.onrender.com) and the code is at [github.com/aayush-wemakedevs/shikayat-desk](https://github.com/aayush-wemakedevs/shikayat-desk), so you can talk to it before you build anything of your own. It is a free instance, so the first request after a quiet spell waits on a cold start, and it is capped at six complaints per address every ten minutes, because each one spends five paid API calls.

## From an API key to a first response

You need a key from [dashboard.sarvam.ai](https://dashboard.sarvam.ai) and one package. The SDK is [`sarvamai`](https://pypi.org/project/sarvamai/), the key goes in as a subscription key rather than a bearer token, and everything else is a method on one client.

```bash
pip install -U sarvamai fastapi uvicorn python-multipart
```

```python
from sarvamai import SarvamAI
client = SarvamAI(api_subscription_key=os.environ["SARVAM_API_KEY"], timeout=35)
```

That client is the whole surface area. Speech in is [`client.speech_to_text.transcribe`](https://docs.sarvam.ai/api-reference/speech-to-text/transcribe), text in and text out is `client.chat.completions`, and speech out is [`client.text_to_speech.convert`](https://docs.sarvam.ai/api-reference/text-to-speech/convert). The backend here is a single FastAPI file with one endpoint that the browser posts a recording to.

![One recording, five API calls](images/an-indian-language-voice-support-desk-on-sarvam-ai/call-flow.jpg)

## The caller never tells you what language they are speaking

The transcribe call takes a `language_code`, and leaving it out is what makes the desk work. The model detects the language itself and hands it back with a probability, so the same endpoint serves a Hindi caller and an English one without the page asking anybody to choose.

```python
client.speech_to_text.transcribe(
    file=audio_file,
    model="saaras:v4",
    mode="transcribe",
    keyterms=["bijli", "meter", "reading", "connection", "bill"],
)
```

`keyterms` is worth setting even though it is optional. These are domain words the model should expect, up to fifty of them, and for an electricity provider the difference between hearing "meter reading" and "meter leading" is whether the ticket routes correctly. It is only available on `saaras:v4`.

Here is a Hindi complaint, about a power cut since the previous night, going through the whole thing:

![A Hindi complaint about a power cut, all the way through](images/an-indian-language-voice-support-desk-on-sarvam-ai/hindi-complaint.jpg)

The chip under the bubble is `hi-IN` with the confidence the model returned. The reply underneath came back in Devanagari because the system prompt tells the chat model to answer in the same language and writing system as the customer, and the Play button holds a wav that Sarvam's TTS generated from exactly that text.

The English in the agent panel is the same recording sent a second time with `mode="translate"` instead. That is a deliberate choice rather than a translation of the transcript: the audio goes to the API twice, once to get the caller's own words and once to get English, which keeps the agent's view independent of whatever the first pass produced.

## Two things that broke

The first was audio format. Chrome's MediaRecorder labels its output `audio/webm;codecs=opus`, and that full string travels as the content type of the multipart part. Sarvam accepts the WebM container, but it matches the media type exactly, so the codec parameter alone is enough to fail the request:

```
400 Invalid file type: audio/webm;codecs=opus
```

The same bytes go through once the parameter is trimmed off, which is one line in the handler:

```python
media_type = (file.content_type or "audio/webm").split(";", 1)[0]
```

The second was the voice. Every TTS speaker belongs to a specific model, and asking `bulbul:v4-flash` for a speaker that belongs to another model returns a 400 rather than falling back to something sensible. Since the language is only known at runtime, the mapping lives in code:

```python
SPEAKERS = {"hi-IN": "aparna_hi_customer", "en-IN": "aparna_en_edtech"}
speaker = SPEAKERS.get(language, "shubh_enhi_banking")
```

Pass the speaker explicitly on every call. The SDK's own default is not valid for the current models, which is an easy half hour to lose if you assume otherwise.

## Nearly three of the four seconds are one call

Every Sarvam call in the app is wrapped in `perf_counter`, and the four numbers come back in the response so the page can show them. They are not close to each other.

![Where the four seconds go](images/an-indian-language-voice-support-desk-on-sarvam-ai/latency.jpg)

Transcription, translation and the chat reply all land between 270 and 480 milliseconds. Speech synthesis takes about three seconds, and across four separate runs it came in at 2,759, 2,797, 2,801 and 3,007 milliseconds, so it is not noise. Three quarters of what the caller waits for is the one call that turns a few sentences of text into audio, and the slowest of those four runs is the one with the longest reply. That makes "keep the reply to two or three sentences" a latency decision rather than a stylistic one.

The measurements also show that close to 700 milliseconds of the wait belongs to nobody. The English translation and the ticket JSON are both for the human agent, and the caller's spoken answer does not depend on either, so running them in front of the response is the easiest thing to write rather than the right thing to ship. Taking the translation off the caller's path saves 273 milliseconds of the 4,084 that the four timed calls came to, and the ticket call behind it, which the response does not even report a time for, is roughly another 400.

Those numbers are from the app on a laptop. The same commit on the free Oregon instance behind the link above took 1,817 ms to transcribe, 682 to translate, 1,014 to answer and 5,217 to speak, which is a little over twice as long end to end. Both the smaller machine and the longer trip to the API are inside that figure, and it is worth knowing before you promise anyone a response time measured on your own laptop.

## Confidence is not a quality signal

One caution from testing. When I fed the desk a deliberately poor recording, the language detector did not hesitate or return a low score. It confidently picked the wrong language, at 99.9 percent, and the rest of the pipeline did exactly what it was told with that answer, producing a fluent reply built on a bad transcript.

`language_probability` describes how sure the model is about its own guess, not whether your audio was good enough to guess from. If a wrong language would be expensive in your project, check the transcript for signs of nonsense before acting on it, or show the detected language back to the user the way this app does and let them see it.

## Festive Hacks, 25 November, Bengaluru

Festive Hacks runs on 25 November at BIEC in Bengaluru, on the floor of WeAreDevelopers Conference India. It is one day: doors at 9:00 AM, an opening conversation with Hitesh Choudhary and Saiyam Pathak, building from late morning, and submissions closing at 5:00 PM IST. Judging runs until 5:45 and the winners are called on stage at 6:00. Every project has to use all three sponsor tools, Flagsmith, NudgeBee and Sarvam AI.

The grand prize is a fully sponsored VIP trip to Berlin for the whole team for WeAreDevelopers World Congress 2027, flights and stay included, plus ₹1 Lakh in cash and Keychron keyboards. Accepted hackers get a free conference pass, and tickets for the two conference days are ₹999 with the code WEMAKEDEVS999.

The themes are all festive-season problems rather than technology categories, which suits a voice project well. Wedding season covers RSVPs, vendor tracking and the shagun ledger. Going home is tatkal alerts, sold-out buses and cab splits. There is also gifting, year-in-review recaps, get-togethers, and surviving December on a budget. Each one puts someone on a phone, in a hurry, describing a situation to another person, which is the shape of problem Sarvam is good at.

You can [apply on Luma from the Festive Hacks page](https://www.wemakedevs.org/hackathons/festivehacks), and the [resources page](https://www.wemakedevs.org/hackathons/festivehacks/resources) collects the quickstarts for all three tools in one place.

## What to do between now and the 25th

Today is the 23rd, which leaves two clear days, and that is plenty if you spend them on the parts that are slow rather than on the idea.

**Today.** Talk to the live desk first, in whatever language you speak, and watch the language chip and the four timings. Then get a key and make the three calls work on their own, outside any app. Record ten seconds on your phone, run it through transcribe with no `language_code` set, and watch what comes back. Then send that text to the chat model and the reply to TTS. An hour of that tells you more about what your project can promise than a day of planning will.

**Tomorrow.** Put a screen in front of it. Recording in the browser, showing the detected language back to the user, and playing the returned audio are each small, but they are where the time goes on the day, and a working page the night before is what lets you spend the 25th on the part that is actually yours.

**On the 25th.** Pick one person with one festive-season headache and solve it end to end, with the repo, the setup README and the demo video ready before 5:00 PM. Projects that do one job completely read far better at judging than projects that gesture at three.
