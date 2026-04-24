-- ============================================================
--  EDULISH — 40 Câu hỏi mẫu (Vocabulary, Grammar, Reading, Listening)
-- ============================================================

USE edulish;

DROP TABLE IF EXISTS questions;

CREATE TABLE questions (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  content      TEXT         NOT NULL,
  option_a     VARCHAR(500) NOT NULL,
  option_b     VARCHAR(500) NOT NULL,
  option_c     VARCHAR(500) NOT NULL,
  option_d     VARCHAR(500) NOT NULL,
  correct_ans  ENUM('A','B','C','D') NOT NULL,
  category     ENUM('vocabulary','grammar','reading','listening') NOT NULL DEFAULT 'vocabulary',
  difficulty   ENUM('easy','medium','hard') NOT NULL DEFAULT 'easy',
  explanation  TEXT         NULL,
  created_by   INT UNSIGNED NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO questions (content, option_a, option_b, option_c, option_d, correct_ans, category, difficulty, explanation) VALUES
-- ── Vocabulary (10 câu) ──
('What does "eloquent" mean?', 'Fluent and persuasive in speaking or writing', 'Feeling nervous or anxious', 'Being extremely hungry', 'Moving very slowly', 'A', 'vocabulary', 'medium', 'Eloquent refers to fluent or persuasive speaking or writing.'),
('What is the synonym of "benevolent"?', 'Cruel', 'Kind', 'Lazy', 'Angry', 'B', 'vocabulary', 'medium', 'Benevolent means well-meaning and kindly.'),
('What does "persevere" mean?', 'To give up easily', 'To continue despite difficulties', 'To act suddenly', 'To feel very happy', 'B', 'vocabulary', 'easy', 'Persevere means to continue in a course of action even in the face of difficulty.'),
('What is the antonym of "abundant"?', 'Plentiful', 'Scarce', 'Sufficient', 'Generous', 'B', 'vocabulary', 'medium', 'Abundant means plentiful; the opposite is scarce.'),
('What is the meaning of the idiom "bite the bullet"?', 'To eat something hard', 'To endure a painful situation with courage', 'To shoot someone', 'To be very hungry', 'B', 'vocabulary', 'medium', 'To bite the bullet means to face a difficult or unpleasant situation with courage.'),
('Which word means "extremely beautiful and delicate"?', 'Exquisite', 'Ugly', 'Ordinary', 'Rough', 'A', 'vocabulary', 'hard', 'Exquisite means extremely beautiful and, typically, delicate.'),
('Choose the word that best fits: "She has a very ___ schedule this week."', 'Hectic', 'Calm', 'Quiet', 'Slow', 'A', 'vocabulary', 'easy', 'Hectic means full of incessant or frantic activity.'),
('What is the synonym of "meticulous"?', 'Careless', 'Sloppy', 'Careful', 'Quick', 'C', 'vocabulary', 'medium', 'Meticulous means showing great attention to detail; very careful and precise.'),
('What does "lucrative" mean?', 'Producing a great deal of profit', 'Causing loss', 'Boring', 'Exciting', 'A', 'vocabulary', 'medium', 'Lucrative means producing a great deal of profit.'),
('Which word describes someone who speaks many languages?', 'Monolingual', 'Bilingual', 'Polyglot', 'Introvert', 'C', 'vocabulary', 'medium', 'A polyglot is a person who knows and is able to use several languages.'),

-- ── Grammar (10 câu) ──
('Choose the correct form: She ___ to school every day.', 'go', 'goes', 'going', 'gone', 'B', 'grammar', 'easy', 'Third-person singular takes the -s form in simple present tense.'),
('Which sentence is grammatically correct?', 'I has been waiting for two hours.', 'I have been waiting for two hours.', 'I had been wait for two hours.', 'I have wait for two hours.', 'B', 'grammar', 'medium', 'Present perfect continuous: have/has + been + verb-ing.'),
('Choose the correct preposition: She is interested ___ learning English.', 'at', 'on', 'in', 'with', 'C', 'grammar', 'easy', '"Interested in" is the correct collocation.'),
('Which tense is used in: "By the time she arrives, I will have finished the report."?', 'Simple Future', 'Future Continuous', 'Future Perfect', 'Present Perfect', 'C', 'grammar', 'hard', 'Future Perfect describes an action that will be completed before a specific future time.'),
('Choose the correct sentence:', 'Neither of the students are ready.', 'Neither of the students is ready.', 'Neither of the students was ready yesterday.', 'Both B and C are correct', 'D', 'grammar', 'hard', '"Neither of + plural noun" takes a singular verb.'),
('If I ___ rich, I would travel the world.', 'am', 'was', 'were', 'will be', 'C', 'grammar', 'medium', 'In the second conditional, "were" is used for all subjects in formal English.'),
('I am looking forward to ___ you soon.', 'see', 'seeing', 'saw', 'be seen', 'B', 'grammar', 'medium', '"Look forward to" is followed by a gerund (verb-ing).'),
('The book, ___ was written by J.K. Rowling, is very popular.', 'who', 'which', 'that', 'whom', 'B', 'grammar', 'medium', 'Non-defining relative clauses use "which" for things, not "that".'),
('He asked me where ___.', 'did I live', 'do I live', 'I lived', 'I live', 'C', 'grammar', 'medium', 'Reported speech statements do not use question word order. The tense often shifts back.'),
('Hardly ___ the house when it started to rain.', 'had I left', 'I had left', 'did I leave', 'I left', 'A', 'grammar', 'hard', 'Inversion is required after "Hardly" at the beginning of a sentence.'),

-- ── Reading (10 câu) ──
('Read the sentence and answer: "The quick brown fox jumps over the lazy dog." Who jumps?', 'The dog', 'The fox', 'The cat', 'The bear', 'B', 'reading', 'easy', 'The subject of the verb "jumps" is "fox".'),
('What is the main idea of a paragraph about the benefits of eating apples?', 'Apples are red.', 'Oranges are better than apples.', 'Eating apples is good for your health.', 'Apples grow on trees.', 'C', 'reading', 'easy', 'The main idea summarizes the core message, which is the health benefits.'),
('In the sentence "The CEO''s decision was controversial," what does "controversial" mean based on context?', 'Universally accepted', 'Causing public disagreement', 'Unimportant', 'Quickly made', 'B', 'reading', 'medium', 'Controversial means giving rise or likely to give rise to public disagreement.'),
('If a text says "The sky was a canvas of dark, ominous clouds," what is the likely tone?', 'Cheerful', 'Threatening', 'Humorous', 'Romantic', 'B', 'reading', 'medium', '"Ominous" means giving the impression that something bad is going to happen.'),
('According to a manual saying "Do not use near water," what should you do?', 'Wash it before use', 'Keep it dry', 'Use it in the bath', 'Water it daily', 'B', 'reading', 'easy', 'It explicitly warns against proximity to water.'),
('What does "it" refer to in: "The car was old, but it still ran well."?', 'The road', 'The driver', 'The car', 'The age', 'C', 'reading', 'easy', '"It" is a pronoun referring back to the noun "car".'),
('A passage states "Despite the heavy rain, the football match continued." What happened?', 'The match was canceled.', 'It didn''t rain.', 'They played in the rain.', 'The match was delayed.', 'C', 'reading', 'medium', '"Despite" indicates the action happened regardless of the condition.'),
('Read: "She is an avid reader; her room is filled with books." What does "avid" mean?', 'Reluctant', 'Enthusiastic', 'Slow', 'Occasional', 'B', 'reading', 'medium', 'Context clue "filled with books" suggests she reads enthusiastically.'),
('If an article discusses "mitigating climate change," what is the goal?', 'Worsening it', 'Ignoring it', 'Reducing its severity', 'Studying its history', 'C', 'reading', 'hard', 'To mitigate means to make less severe, serious, or painful.'),
('Read: "The restaurant was fully booked, yet we managed to get a table." What is the relationship between the clauses?', 'Cause and effect', 'Contrast', 'Addition', 'Chronological', 'B', 'reading', 'medium', '"Yet" introduces a contrasting idea.'),

-- ── Listening (10 câu) ──
('(Transcript) "Attention passengers, flight 302 to London is delayed." What is the announcement about?', 'A train arrival', 'A flight delay', 'A lost child', 'A boarding call', 'B', 'listening', 'easy', 'The speaker explicitly states the flight is delayed.'),
('(Transcript) "I''d like a coffee, please. Large, with milk." What did the person order?', 'Small tea', 'Large coffee with milk', 'Large black coffee', 'Small coffee with milk', 'B', 'listening', 'easy', 'The order matches option B exactly.'),
('(Transcript) "The meeting has been moved to 3 PM in Room B." When is the meeting?', '2 PM', '3 PM', '4 PM', 'Room B', 'B', 'listening', 'easy', 'The speaker states the time is 3 PM.'),
('(Transcript) "Don''t forget to bring an umbrella; it looks like rain." What is the advice?', 'Wear a coat', 'Bring sunglasses', 'Take an umbrella', 'Stay indoors', 'C', 'listening', 'easy', 'The speaker directly advises bringing an umbrella.'),
('(Transcript) "To get to the bank, go straight and turn left at the corner." Where is the bank?', 'Straight ahead', 'On the right', 'On the left after turning', 'Behind you', 'C', 'listening', 'medium', 'The directions are to go straight then turn left.'),
('(Transcript) "I''ve been working here for five years." How long has the person worked there?', '1 year', '5 months', '5 years', '10 years', 'C', 'listening', 'easy', 'The duration mentioned is five years.'),
('(Transcript) "Can I leave a message for Mr. Smith?" What does the caller want to do?', 'Speak to Mr. Smith directly', 'Leave a message', 'Find out where Mr. Smith is', 'Complain about Mr. Smith', 'B', 'listening', 'medium', 'The caller explicitly asks to leave a message.'),
('(Transcript) "The concert tickets are sold out." What does this mean?', 'You can buy tickets now', 'The concert is canceled', 'No more tickets are available', 'The tickets are cheap', 'C', 'listening', 'medium', 'Sold out means all available items have been purchased.'),
('(Transcript) "We need to finalize the report by Friday." What is the deadline?', 'Thursday', 'Friday', 'Saturday', 'Next week', 'B', 'listening', 'easy', 'The speaker sets Friday as the deadline.'),
('(Transcript) "I prefer traveling by train rather than by plane." What is the speaker''s preference?', 'Planes', 'Cars', 'Trains', 'Buses', 'C', 'listening', 'medium', '"Prefer... rather than" indicates trains are the favored choice.');
