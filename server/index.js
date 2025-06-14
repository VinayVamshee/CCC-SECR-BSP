require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./DB/connectDB')

const BooksSchema = require('./models/Books')
const CardSchema = require('./models/Card')
const ContactSchema = require('./models/Contacts')
const CategorySchema = require('./models/Category')
const VideoSchema = require('./models/Videos')
const VideoCategorySchema = require('./models/VideoCategory')
const UserSchema = require('./models/Users')
const NoticeSchema = require('./models/Notice')
const OtherDropDownSchema = require('./models/OtherDropDown')
const FeedbackSchema = require('./models/Feedback')
const StaffUserSchema = require('./models/StaffUsers')
const NoticeCategorySchema = require('./models/NoticeCategory')
const quizQuestionSchema = require('./models/QuizQuestion')
const quizSubmissionSchema = require('./models/QuizSubmission')


const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

const admin = require("./firebaseAdmin");
const FcmToken = require("./models/FcmToken");
app.post("/save-fcm-token", async (req, res) => {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
        return res.status(400).json({ error: "Missing userId or fcmToken" });
    }

    // Check if the token already exists to avoid duplicates
    const existingToken = await FcmToken.findOne({ token: fcmToken });
    if (!existingToken) {
        await FcmToken.create({ userId, token: fcmToken });
    }

    res.json({ success: true, message: "FCM Token saved" });
});

const sendNotification = async (userId, noticeTitle, noticeDescription) => {
    const tokens = await FcmToken.find({ userId });
    const tokenList = tokens.map(t => t.token);

    if (tokenList.length === 0) return console.log("No devices found.");

    const message = {
        notification: {
            title: noticeTitle,
            body: noticeDescription,
            // click_action: "http://localhost:3000/Notice"
        },
        tokens: tokenList
    };

    await admin.messaging().sendEachForMulticast(message)
        .then(response => console.log("Notifications sent:", response))
        .catch(error => {
            console.error("Error sending notification:", error.message);
            if (error.details) {
                console.error("Error details:", error.details);
            }
        });

};



app.post('/AddNewContact', async (req, res) => {
    try {
        const newContact = new ContactSchema(req.body);
        await newContact.save();
        res.status(200).json({ message: 'Contact added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding contact' });
    }
})

app.delete('/DeleteContact/:id', (req, res) => {
    const id = req.params.id;
    ContactSchema.findByIdAndDelete({ _id: id })
        .then(result => res.json(result))
        .catch(error => res.json(error))
})


app.get('/GetContacts', (req, res) => {
    ContactSchema.find({})
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.get('/GetContactProfile/:id', (req, res) => {
    const id = req.params.id;
    ContactSchema.findById({ _id: id })
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.put('/EditContactProfile/:id', (req, res) => {
    const id = req.params.id;
    const { CREWID, 'CREW NAME': crewName, FATHER, GENDER, TRACTION, CADRE, 'MOBILE NO': mobileNo, 'CREW TYPE': crewType, 'AVAIL DATE': availDate, 'EMP CODE': empCode, 'APP.DATE': appDate } = req.body;

    const updateObject = {
        CREWID,
        'CREW NAME': crewName,
        FATHER,
        GENDER,
        TRACTION,
        CADRE,
        'MOBILE NO': mobileNo,
        'CREW TYPE': crewType,
        'AVAIL DATE': availDate,
        'EMP CODE': empCode,
        'APP.DATE': appDate
    };

    ContactSchema.findByIdAndUpdate({ _id: id }, updateObject)
        .then(result => res.json(result))
        .catch(error => res.json(error));
});






app.post('/Register', (req, res) => {
    UserSchema.create(req.body)
        .then(users => res.json(users))
        .catch(error => res.json(error))
})

app.post('/Login', (req, res) => {
    const { username, password } = req.body;
    UserSchema.findOne({ username: username })
        .then(user => {
            if (user) {
                if (user.password === password) {

                    const token = jwt.sign({ username: user.username }, 'secret_key', { expiresIn: '1hr' });
                    res.json({ token: token, message: 'Login Successful' })
                }
                else {
                    res.json('Please Check the Password')
                }
            } else {
                res.json('Not Existing')
            }
        })
})


app.post('/StaffRegister', (req, res) => {
    StaffUserSchema.create(req.body)
        .then(users => res.json(users))
        .catch(error => res.json(error))
})

app.post('/StaffLogin', (req, res) => {
    const { Staffusername, Staffpassword } = req.body;

    StaffUserSchema.findOne({ Staffusername: Staffusername })
        .then(user => {
            if (user) {
                if (user.Staffpassword === Staffpassword) {
                    // Include _id in the token payload
                    const token = jwt.sign(
                        { Staffusername: user.Staffusername, id: user._id },
                        'secret_key'
                    );

                    res.json({
                        token: token,
                        id: user._id,
                        message: 'Login Successful'
                    });
                } else {
                    res.json('Please Check the Password');
                }
            } else {
                res.json('Not Existing');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json('Server error');
        });
});


app.post("/AddNewBook", (req, res) => {
    BooksSchema.create(req.body)
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.get('/GetBooks', (req, res) => {
    BooksSchema.find({})
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.delete('/DeleteBook/:id', (req, res) => {
    const id = req.params.id;
    BooksSchema.findByIdAndDelete({ _id: id })
        .then(result => res.json(result))
        .catch(error => res.json(error))
})

app.post("/AddNewCard", (req, res) => {
    CardSchema.create(req.body)
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.get('/GetCards', (req, res) => {
    CardSchema.find({})
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.delete('/DeleteCard/:id', (req, res) => {
    const id = req.params.id;
    CardSchema.findByIdAndDelete({ _id: id })
        .then(result => res.json(result))
        .catch(error => res.json(error))
})

app.post("/AddNewCategory", (req, res) => {
    CategorySchema.create(req.body)
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.get('/GetCategory', (req, res) => {
    CategorySchema.find({})
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.delete('/DeleteCategory/:id', (req, res) => {
    const id = req.params.id;
    CategorySchema.findByIdAndDelete({ _id: id })
        .then(result => res.json(result))
        .catch(error => res.json(error))
})

app.post("/AddNewVideo", (req, res) => {
    VideoSchema.create(req.body)
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.get('/GetVideos', (req, res) => {
    VideoSchema.find({})
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.delete('/DeleteVideo/:id', (req, res) => {
    const id = req.params.id;
    VideoSchema.findByIdAndDelete({ _id: id })
        .then(result => res.json(result))
        .catch(error => res.json(error))
})

app.post("/AddNewVideoCategory", (req, res) => {
    VideoCategorySchema.create(req.body)
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.get('/GetVideoCategory', (req, res) => {
    VideoCategorySchema.find({})
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.delete('/DeleteVideoCategory/:id', (req, res) => {
    const id = req.params.id;
    VideoCategorySchema.findByIdAndDelete({ _id: id })
        .then(result => res.json(result))
        .catch(error => res.json(error))
})

app.post("/AddNewNotice", async (req, res) => {
    const { Title, Description, Category, TimeAdded } = req.body;
    try {
        await sendNotification("sharedUserAccount", Title, Description);
        const notice = await NoticeSchema.create(req.body);
        res.json({ success: true, message: "Notice added & Notification sent", notice });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to add notice or send notification" });
    }
});


app.get('/GetNotice', (req, res) => {
    NoticeSchema.find({})
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.delete('/DeleteNotice/:id', (req, res) => {
    const id = req.params.id;
    NoticeSchema.findByIdAndDelete({ _id: id })
        .then(result => res.json(result))
        .catch(error => res.json(error))
})

app.post("/AddNewNoticeCategory", (req, res) => {
    NoticeCategorySchema.create(req.body)
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.get('/GetNoticeCategory', (req, res) => {
    NoticeCategorySchema.find({})
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.delete('/DeleteNoticeCategory/:id', (req, res) => {
    const id = req.params.id;
    NoticeCategorySchema.findByIdAndDelete({ _id: id })
        .then(result => res.json(result))
        .catch(error => res.json(error))
})

app.post("/AddNewOtherDropDown", (req, res) => {
    OtherDropDownSchema.create(req.body)
        .then(result => res.json(result))
        .catch(error => res.json(error));
});


app.get('/GetOtherDropDown', (req, res) => {
    OtherDropDownSchema.find({})
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.delete('/DeleteOtherDropDown/:id', (req, res) => {
    const id = req.params.id;
    OtherDropDownSchema.findByIdAndDelete({ _id: id })
        .then(result => res.json(result))
        .catch(error => res.json(error))
})

app.post("/AddNewFeedback", (req, res) => {
    FeedbackSchema.create(req.body)
        .then(result => res.json(result))
        .catch(error => {
            console.error('Error creating feedback:', error);
            res.json(error);
        });
});

app.get('/GetFeedback', (req, res) => {
    FeedbackSchema.find({})
        .then(result => res.json(result))
        .catch(error => res.json(error))
});

app.delete('/DeleteFeedback/:id', (req, res) => {
    const id = req.params.id;
    FeedbackSchema.findByIdAndDelete({ _id: id })
        .then(result => res.json(result))
        .catch(error => res.json(error))
})

app.post("/AddNewQuizQuestion", (req, res) => {
    quizQuestionSchema.create(req.body)
        .then(result => res.json(result))
        .catch(error => res.json(error));
});

app.get("/GetQuizQuestions", (req, res) => {
    quizQuestionSchema.find({})
        .then(result => res.json(result))
        .catch(error => res.json(error));
});
app.put("/UpdateQuizQuestion/:id", (req, res) => {
    const id = req.params.id;
    quizQuestionSchema.findByIdAndUpdate(id, req.body, { new: true })
        .then(result => res.json(result))
        .catch(error => res.json(error));
});
app.delete("/DeleteQuizQuestion/:id", (req, res) => {
    const id = req.params.id;
    quizQuestionSchema.findByIdAndDelete(id)
        .then(result => res.json(result))
        .catch(error => res.json(error));
});

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

app.post("/StartQuiz", async (req, res) => {
  const { category, staffId } = req.body;

  try {
    let questions = await quizQuestionSchema.find({ category });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No questions available" });
    }

    questions = shuffle(questions).slice(0, 20).map(q => ({
      _id: q._id,
      question: q.question,
      options: shuffle([...q.options])
    }));

    const startTime = Date.now();                // current time
    const visibleDuration = 20 * 60 * 1000;      // 20 mins for frontend
    const bufferDuration = 2 * 60 * 1000;        // 2 mins buffer
    const jwtDuration = visibleDuration + bufferDuration; // 22 mins total

    const quizToken = jwt.sign({
      staffId,
      category,
      questions,
      startTime
    }, 'quiz_secret_key', { expiresIn: Math.floor(jwtDuration / 1000) }); // in seconds

    const endTime = startTime + visibleDuration; // only send 20 mins endTime

    return res.json({
      token: quizToken,
      questions,
      startTime,
      endTime // frontend will use this for countdown
    });

  } catch (error) {
    console.error("Error starting quiz:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/SubmitQuiz", async (req, res) => {
  const { staffId, token, responses } = req.body;

  try {
    const decoded = jwt.verify(token, "quiz_secret_key");
    const { startTime, category } = decoded;

    // Check if already submitted (optional)
    const alreadySubmitted = await quizSubmissionSchema.findOne({ staffId, category, startTime });
    if (alreadySubmitted) {
      return res.status(400).json({ message: "Quiz already submitted" });
    }

    // Calculate score
    let correctCount = 0;
    const formattedResponses = [];

    for (let r of responses) {
      const question = await quizQuestionSchema.findById(r.questionId);
      const correct = question?.answer || null;
      const isCorrect = r.selected === correct;

      if (isCorrect) correctCount++;

      formattedResponses.push({
        questionId: r.questionId,
        question: r.question,
        selected: r.selected,
        correctAnswer: correct,
        isCorrect
      });
    }

    const submission = new quizSubmissionSchema({
      staffId,
      category,
      startTime,
      endTime: Date.now(),
      totalQuestions: responses.length,
      correctAnswers: correctCount,
      responses: formattedResponses
    });

    await submission.save();

    return res.json({ message: "Quiz submitted successfully", correctCount });

  } catch (err) {
    console.error("SubmitQuiz error:", err);
    return res.status(401).json({ message: "Invalid or expired quiz token" });
  }
});

app.get("/GetAllQuizSubmissions", async (req, res) => {
  try {
    const submissions = await quizSubmissionSchema.find({});

    // For each submission, find corresponding staff user info
    const results = await Promise.all(submissions.map(async (sub) => {
      const staff = await StaffUserSchema.findById(sub.staffId);
      return {
        _id: sub._id,
        staffId: sub.staffId,
        staffName: staff ? staff.Staffusername : "Unknown",
        phone: staff ? staff.StaffPhone : "N/A",
        category: sub.category,
        startTime: sub.startTime,
        endTime: sub.endTime,
        totalQuestions: sub.totalQuestions,
        correctAnswers: sub.correctAnswers,
        responses: sub.responses
      };
    }));

    res.json(results);

  } catch (err) {
    console.error("GetAllQuizSubmissions error:", err);
    res.status(500).json({ message: "Server error" });
  }
});




















const start = async () => {
    try {
        await connectDB();
        app.listen(PORT, '0.0.0.0', () => {
            console.log('Server Connected');
        })
    } catch (error) {
        console.log(error);
    }
}

start();

module.exports = app;