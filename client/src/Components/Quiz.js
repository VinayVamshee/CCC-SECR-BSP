import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import * as bootstrap from 'bootstrap';

export default function QuizQuestionForm() {
  const [IsLoggedIn, setIsLoggedIn] = useState(false);
  const [IsStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [category, setCategory] = useState('');
  const [question, setQuestion] = useState('');
  const [numOptions, setNumOptions] = useState(0);
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [success, setSuccess] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [timer, setTimer] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    const staffToken = localStorage.getItem('Stafftoken');
    setIsStaffLoggedIn(!!staffToken);
  }, []);

  useEffect(() => {
    const savedAnswers = localStorage.getItem('QuizAnswers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('QuizAnswers', JSON.stringify(answers));
    }
  }, [answers]);


  useEffect(() => {
    const savedToken = localStorage.getItem('QuizToken');
    const savedQuestions = localStorage.getItem('QuizQuestions');
    const savedEndTime = localStorage.getItem('QuizEndTime');

    if (savedToken && savedQuestions && savedEndTime && !isSubmitted) {
      const parsedQuestions = JSON.parse(savedQuestions);
      const timeLeft = Math.floor((parseInt(savedEndTime) - Date.now()) / 1000);

      if (timeLeft > 0) {
        setQuizQuestions(parsedQuestions);
        setTimer(timeLeft);
      } else {
        localStorage.removeItem('QuizToken');
        localStorage.removeItem('QuizQuestions');
        localStorage.removeItem('QuizEndTime');
      }
    }
  }, [isSubmitted]);



  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSave = async () => {
    if (!category || !question || options.includes('') || !correctAnswer) {
      alert("Please fill all fields properly.");
      return;
    }

    const data = { category, question, options, answer: correctAnswer };

    try {
      setIsLoading(true);
      await axios.post('https://ccc-bsp-server.vercel.app/AddNewQuizQuestion', data);
      setSuccess(true);
      setCategory('');
      setQuestion('');
      setNumOptions(0);
      setOptions([]);
      setCorrectAnswer('');
    } catch (error) {
      console.error("Error saving question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = async (category) => {
    const staffToken = localStorage.getItem('Stafftoken');
    const staffId = jwtDecode(staffToken).id;

    try {
      setIsLoading(true);
      const res = await axios.post("https://ccc-bsp-server.vercel.app/StartQuiz", { category, staffId });

      const { token, questions, endTime } = res.data;

      localStorage.setItem('QuizToken', token);
      localStorage.setItem('QuizStartTime', Date.now());
      localStorage.setItem('QuizEndTime', endTime);
      localStorage.setItem('QuizQuestions', JSON.stringify(questions));

      setQuizQuestions(questions);
      setTimer(Math.floor((endTime - Date.now()) / 1000));
      setIsSubmitted(false);
    } catch (err) {
      alert("Failed to start quiz. Try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  const [submitLoading, setSubmitLoading] = useState(false);

  const [score, setScore] = useState(null);
  const [total, setTotal] = useState(null);

  const handleSubmit = async () => {
    if (submitLoading) return;
    setSubmitLoading(true);

    const staffToken = localStorage.getItem('Stafftoken');
    const staffId = jwtDecode(staffToken).id;
    const token = localStorage.getItem('QuizToken');

    const submittedData = quizQuestions.map(q => ({
      questionId: q._id,
      question: q.question,
      selected: answers[q._id] || null
    }));

    try {
      const res = await axios.post("https://ccc-bsp-server.vercel.app/SubmitQuiz", {
        staffId,
        token,
        responses: submittedData,
      });

      // ✅ Use correct score from backend
      const correctCount = res.data.correctCount || 0;

      setScore(correctCount);
      setTotal(quizQuestions.length);

      // ✅ Show Bootstrap modal manually
      const thankYouModal = new bootstrap.Modal(document.getElementById('thankYouModal'));
      thankYouModal.show();

      // ✅ Clear states
      setQuizQuestions([]);
      setAnswers({});
      setTimer(0);
      setIsSubmitted(true);

      // ✅ Remove from localStorage
      localStorage.removeItem('QuizToken');
      localStorage.removeItem('QuizStartTime');
      localStorage.removeItem('QuizEndTime');
      localStorage.removeItem('QuizQuestions');
      fetchQuizSubmissions();
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("Failed to submit quiz");
    } finally {
      setSubmitLoading(false);
    }
  };

  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [sorted, setSorted] = useState([]);

  const fetchQuizSubmissions = async () => {
    try {
      const res = await axios.get("https://ccc-bsp-server.vercel.app/GetAllQuizSubmissions");

      // ✅ Sort by `endTime` (latest submissions first)
      const sortedSubmissions = res.data.sort((a, b) => b.endTime - a.endTime);

      setSubmissions(sortedSubmissions);
      setSorted(sortedSubmissions);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  useEffect(() => {
    fetchQuizSubmissions();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = submissions.filter(s =>
      s.staffName.toLowerCase().includes(value)
    );
    setSorted(filtered);
  };

  useEffect(() => {
    if (timer <= 0) return;

    const countdown = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          alert("Time's up! Auto-submitting quiz...");
          handleSubmit(); // ✅ Call only here
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
    // eslint-disable-next-line 
  }, [isSubmitted]);

  return (
    <div className="Quiz">
      <h2 className="text-center mb-4">Add New Quiz Question</h2>

      {IsLoggedIn && (
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-sm btn-warning" data-bs-toggle="collapse" data-bs-target="#addQuestionCollapse">
            + Add Question
          </button>
          <button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#submissionsModal">
            View All Quiz Submissions
          </button>
        </div>
      )}

      {/* Modal */}
      <div className="modal fade" id="submissionsModal" tabIndex="-1" aria-labelledby="submissionsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="submissionsModalLabel">All Quiz Submissions</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              {/* Search, Sort & Filter Controls */}
              <div className="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
                <input
                  type="text"
                  className="form-control w-auto flex-grow-1"
                  placeholder="Search by Staff Name"
                  value={search}
                  onChange={handleSearch}
                />

                <select
                  className="form-select w-auto"
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "highest") {
                      setSorted(prev => [...prev].sort((a, b) => b.correctAnswers - a.correctAnswers));
                    } else {
                      setSorted(prev => [...prev].sort((a, b) => a.correctAnswers - b.correctAnswers));
                    }
                  }}
                  defaultValue="highest"
                >
                  <option value="highest">Sort by Highest Marks</option>
                  <option value="lowest">Sort by Lowest Marks</option>
                </select>

                <select
                  className="form-select w-auto"
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "both") {
                      setSorted(() => {
                        const filtered = submissions.filter(s => true);
                        return filtered;
                      });
                    } else {
                      setSorted(() => {
                        const filtered = submissions.filter(s => s.category.toLowerCase() === val);
                        return filtered;
                      });
                    }
                    setSearch(""); // clear search when filter changes
                  }}
                  defaultValue="both"
                >
                  <option value="both">Show Both Categories</option>
                  <option value="technical">Technical Only</option>
                  <option value="safety">Safety Only</option>
                </select>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Staff Name</th>
                      <th>Phone No</th>
                      <th>Category</th>
                      <th>Total Questions</th>
                      <th>Correct Answers</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((s, idx) => (
                      <tr key={idx}>
                        <td>{s.staffName || "N/A"}</td>
                        <td>{s.phone || "N/A"}</td>
                        <td>{s.category}</td>
                        <td>{s.totalQuestions}</td>
                        <td>{s.correctAnswers}</td>
                        <td>{new Date(s.startTime).toLocaleString()}</td>
                        <td>{new Date(s.endTime).toLocaleString()}</td>
                      </tr>
                    ))}
                    {sorted.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center">No submissions found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>


      <div className="collapse" id="addQuestionCollapse">
        <div className="card card-body">

          <div className="mb-3">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category</option>
              <option value="technical">Technical</option>
              <option value="safety">Safety</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Question</label>
            <input
              type="text"
              className="form-control"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Number of Options</label>
            <input
              type="number"
              className="form-control"
              min={2}
              max={6}
              value={numOptions}
              onChange={(e) => {
                const count = parseInt(e.target.value);
                setNumOptions(count);
                setOptions(Array(count).fill(''));
                setCorrectAnswer('');
              }}
            />
          </div>

          {options.map((opt, idx) => (
            <div className="mb-2" key={idx}>
              <label className="form-label">Option {idx + 1}</label>
              <input
                type="text"
                className="form-control"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
              />
            </div>
          ))}

          {options.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Correct Answer</label>
              <select
                className="form-select"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              >
                <option value="">Select correct answer</option>
                {options.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                'Save Question'
              )}
            </button>

          </div>

          {success && (
            <div className="alert alert-success mt-3 text-center" role="alert">
              Question saved successfully!
            </div>
          )}

        </div>
      </div>

      {IsStaffLoggedIn && (
        <div className="text-center mt-4">
          <button
            className="btn btn-primary me-3"
            data-bs-toggle="modal"
            data-bs-target="#technicalModal"
          >
            Start Technical Quiz
          </button>
          <button
            className="btn btn-danger"
            data-bs-toggle="modal"
            data-bs-target="#safetyModal"
          >
            Start Safety Quiz
          </button>
        </div>
      )}

      {/* Technical Quiz Modal */}
      <div className="modal fade" id="technicalModal" tabIndex="-1" aria-labelledby="technicalModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content shadow-lg border-0 rounded-4">
            <div className="modal-header bg-primary text-white rounded-top">
              <h5 className="modal-title" id="technicalModalLabel">
                <i className="bi bi-gear-fill me-2"></i> Technical Quiz Instructions
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body text-start fs-5">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <span>Total Questions</span> <strong>20</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Total Time</span> <strong>20 minutes</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Navigation</span> <strong>Allowed</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Auto-submit</span> <strong>After 20 minutes</strong>
                </li>
                <li className="list-group-item text-danger fw-semibold text-center">
                  Cheating is <u>strictly prohibited</u>
                </li>
              </ul>
            </div>
            <div className="modal-footer justify-content-center">
              <button
                className="btn btn-primary px-4 py-2 fw-bold"
                onClick={() => startQuiz('technical')}
                data-bs-dismiss="modal"
              >
                Start Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Quiz Modal */}
      <div className="modal fade" id="safetyModal" tabIndex="-1" aria-labelledby="safetyModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content shadow-lg border-0 rounded-4">
            <div className="modal-header bg-success text-white rounded-top">
              <h5 className="modal-title" id="safetyModalLabel">
                <i className="bi bi-shield-lock-fill me-2"></i> Safety Quiz Instructions
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body text-start fs-5">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <span>Total Questions</span> <strong>20</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Total Time</span> <strong>20 minutes</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Navigation</span> <strong>Allowed</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Auto-submit</span> <strong>After 20 minutes</strong>
                </li>
                <li className="list-group-item text-danger fw-semibold text-center">
                  Cheating is <u>strictly prohibited</u>
                </li>
              </ul>
            </div>
            <div className="modal-footer justify-content-center">
              <button
                className="btn btn-success px-4 py-2 fw-bold"
                onClick={() => startQuiz('safety')}
                data-bs-dismiss="modal"
              >
                Start Test
              </button>
            </div>
          </div>
        </div>
      </div>


      {quizQuestions.length > 0 && (
        <div className="quiz-panel mt-4">
          <div className="d-flex justify-content-center mb-4">
            <div className="badge bg-danger fs-6 px-4 py-2 rounded-pill shadow">
              ⏳ Time Left: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)} mins
            </div>
          </div>

          {quizQuestions.map((q, index) => (
            <div key={q._id} className="card border-0 shadow-sm mb-4 p-2 rounded-4">
              <div className="card-body">
                <h6 className="fw-bold mb-3 text-primary">
                  Q{index + 1}. {q.question}
                </h6>
                <div className="row">
                  {q.options.map((opt, idx) => (
                    <div key={idx} className="col-md-6 mb-2">
                      <label
                        htmlFor={`q_${q._id}_opt_${idx}`}
                        className=" border rounded p-2 d-flex align-items-center"
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          className="form-check-input me-2"
                          type="radio"
                          name={`q_${q._id}`}
                          value={opt}
                          id={`q_${q._id}_opt_${idx}`}
                          onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                        />
                        <span className="form-check-label">{opt}</span>
                      </label>
                    </div>
                  ))}

                </div>
              </div>
            </div>
          ))}

          <div className="text-center mt-4">
            <button
              onClick={handleSubmit}
              disabled={submitLoading}
              className="btn btn-success btn-lg px-5 py-2 fw-semibold shadow"
            >
              {submitLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </button>
          </div>
        </div>
      )}

      <div className="modal fade" id="thankYouModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">🎉 Quiz Submitted</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body text-center">
              <p className="fs-5">✅ Thank you for submitting the quiz!</p>
              <p className="fw-bold">Your Score: {score} / {total}</p>
              <p className="text-muted">To view correct answers, please contact the admin.</p>
            </div>
            <div className="modal-footer justify-content-center">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>



    </div>
  );
}