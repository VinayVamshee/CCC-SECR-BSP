import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

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
      document.getElementById('openThankYouModalBtn').click();

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
  }, [timer]);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingId, setEditingId] = useState(null); // id of question being edited
  const [editData, setEditData] = useState({
    question: "",
    options: ["", "", "", ""],
    answer: "",
    category: "technical",
  });

  const pageSize = 10;

  useEffect(() => {
    axios
      .get("https://ccc-bsp-server.vercel.app/GetQuizQuestions")
      .then((response) => {
        const sortedQuestions = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setQuestions(sortedQuestions);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch questions");
        setLoading(false);
      });
  }, []);

  // Filtered and paged questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const totalPages = Math.ceil(filteredQuestions.length / pageSize);
  const pagedQuestions = filteredQuestions.slice(page * pageSize, (page + 1) * pageSize);

  // Start editing a question
  const startEdit = (q) => {
    setEditingId(q._id);
    setEditData({
      question: q.question,
      options: [...q.options],
      answer: q.answer,
      category: q.category,
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Handle input changes in edit form
  const handleEditChange = (field, value, index = null) => {
    if (field === "options" && index !== null) {
      const newOptions = [...editData.options];
      newOptions[index] = value;
      setEditData({ ...editData, options: newOptions });
    } else {
      setEditData({ ...editData, [field]: value });
    }
  };

  // Submit updated question
  const submitEdit = (id) => {
    axios
      .put(`https://ccc-bsp-server.vercel.app/UpdateQuizQuestion/${id}`, editData)
      .then((res) => {
        // Update the questions array locally
        setQuestions((prev) =>
          prev.map((q) => (q._id === id ? res.data : q))
        );
        setEditingId(null);
      })
      .catch(() => {
        alert("Failed to update question");
      });
  };

  const [detailSubmission, setDetailSubmission] = React.useState(null);

  return (
    <div className="Quiz">

      {IsLoggedIn && (
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-sm btn-warning" data-bs-toggle="collapse" data-bs-target="#addQuestionCollapse">
            + Add Question
          </button>
          <button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#submissionsModal">
            View All Quiz Submissions
          </button>
          <button className="btn btn-sm btn-info" data-bs-toggle="collapse" data-bs-target="#questionsCollapse">
            Show Questions
          </button>
        </div>
      )}

      <div className="collapse" id="questionsCollapse">
        <div className="card card-body">
          {/* Search and Filter */}
          <div className="d-flex gap-3 mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by question..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
            />
            <select
              className="btn border"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical</option>
              <option value="safety">Safety</option>
            </select>
          </div>

          {loading && <p>Loading questions...</p>}
          {error && <p className="text-danger">Error: {error}</p>}
          {!loading && !error && filteredQuestions.length === 0 && <p>No questions available</p>}

          {!loading && !error && filteredQuestions.length > 0 && (
            <>
              {pagedQuestions.map((q) => (
                <div key={q._id} className="card mb-3 shadow-sm position-relative">
                  {/* Category badge */}
                  <span
                    className="badge bg-danger position-absolute p-2"
                    style={{ top: "10px", right: "10px", textTransform: "capitalize" }}
                  >
                    {q.category}
                  </span>

                  <div className="card-body">
                    {editingId === q._id ? (
                      <>
                        {/* Edit form */}
                        <div className="mb-3">
                          <label className="form-label">Question</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editData.question}
                            onChange={(e) => handleEditChange("question", e.target.value)}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Options</label>
                          <div className="row">
                            {editData.options.map((opt, i) => (
                              <div key={i} className="col-6 mb-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  value={opt}
                                  onChange={(e) => handleEditChange("options", e.target.value, i)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Correct Answer</label>
                          <select
                            className="form-select"
                            value={editData.answer}
                            onChange={(e) => handleEditChange("answer", e.target.value)}
                          >
                            <option value="">-- Select Correct Answer --</option>
                            {editData.options.map((opt, i) => (
                              <option key={i} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Category</label>
                          <select
                            className="form-select"
                            value={editData.category}
                            onChange={(e) => handleEditChange("category", e.target.value)}
                          >
                            <option value="technical">Technical</option>
                            <option value="safety">Safety</option>
                          </select>
                        </div>

                        <button
                          className="btn btn-success me-2"
                          onClick={() => submitEdit(q._id)}
                        >
                          Save
                        </button>
                        <button className="btn btn-secondary" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Display question */}
                        <h5 className="card-title">Question:</h5>
                        <p className="card-text">{q.question}</p>

                        <h6>Options:</h6>
                        <div className="row">
                          {q.options.map((opt, i) => (
                            <div key={i} className="col-6 mb-2">
                              <div className="border rounded p-2">{opt}</div>
                            </div>
                          ))}
                        </div>

                        <div className="alert alert-success mb-3" role="alert">
                          <strong>Correct Answer: </strong> {q.answer}
                        </div>

                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => startEdit(q)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger ms-2"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this question?")) {
                              axios
                                .delete(`https://ccc-bsp-server.vercel.app/DeleteQuizQuestion/${q._id}`)
                                .then(() => {
                                  setQuestions((prev) => prev.filter((item) => item._id !== q._id));
                                })
                                .catch(() => {
                                  alert("Failed to delete question");
                                });
                            }
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              <nav>
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                    >
                      Previous
                    </button>
                  </li>
                  <li className="page-item disabled">
                    <span className="page-link">
                      Page {page + 1} of {totalPages}
                    </span>
                  </li>
                  <li className={`page-item ${page >= totalPages - 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>

      {/* All Submissions Modal */}
      <div
        className="modal fade"
        id="submissionsModal"
        tabIndex="-1"
        aria-labelledby="submissionsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="submissionsModalLabel">
                All Quiz Submissions
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
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
                      <th>Actions</th>
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
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#submissionDetailsModal"
                            onClick={() => setDetailSubmission(s)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                    {sorted.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No submissions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Details Modal */}
      <div
        className="modal fade"
        id="submissionDetailsModal"
        tabIndex="-1"
        aria-labelledby="submissionDetailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered">
          <div className="modal-content shadow-lg border-0 rounded-4">
            <div className="modal-header bg-primary text-white rounded-top">
              <h5 className="modal-title" id="submissionDetailsModalLabel">
                Submission Details - {detailSubmission?.staffName || ""}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setDetailSubmission(null)}
              />
            </div>
            <div className="modal-body">
              {!detailSubmission ? (
                <p className="text-center fs-5 my-5">Loading...</p>
              ) : (
                <div className="row g-3">
                  {detailSubmission.responses.map((resp, i) => (
                    <div key={i} className="col-12">
                      <div className="card shadow-sm border-0">
                        <div className="card-body">
                          <h6 className="card-title">
                            Q{i + 1}: {resp.question}
                          </h6>
                          <p className="mb-1">
                            <strong>Your Answer: </strong>
                            <span
                              className={
                                resp.isCorrect ? "badge bg-success" : "badge bg-danger"
                              }
                            >
                              {resp.selected}
                            </span>
                          </p>
                          <p className="mb-0">
                            <strong>Correct Answer: </strong>
                            <span className="text-muted">{resp.correctAnswer}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer border-0 pt-3">
              <button
                className="btn btn-outline-primary"
                data-bs-target="#submissionsModal"
                data-bs-toggle="modal"
                onClick={() => setDetailSubmission(null)}
              >
                ← Back to Submissions
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => setDetailSubmission(null)}
              >
                Close
              </button>
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

      <button
        type="button"
        id="openThankYouModalBtn"
        data-bs-toggle="modal"
        data-bs-target="#thankYouModal"
        style={{ display: 'none' }}
      ></button>


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