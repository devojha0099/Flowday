import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import {
  loadJournal,
  saveJournal,
  loadAllJournals,
  searchJournals,
  clearSearch,
  deleteJournal,
} from "../features/journal/journalSlice";
import { useToday, formatDisplayDate } from "../hooks/useToday";
import Layout from "../components/layout/Layout";

const MOODS = [
  {
    value: 1,
    label: "Rough",
    emoji: "😞",
    color: "bg-red-100 text-red-600 border-red-200",
  },
  {
    value: 2,
    label: "Low",
    emoji: "😕",
    color: "bg-orange-100 text-orange-600 border-orange-200",
  },
  {
    value: 3,
    label: "Okay",
    emoji: "😐",
    color: "bg-yellow-100 text-yellow-600 border-yellow-200",
  },
  {
    value: 4,
    label: "Good",
    emoji: "🙂",
    color: "bg-green-100 text-green-600 border-green-200",
  },
  {
    value: 5,
    label: "Great",
    emoji: "😄",
    color: "bg-indigo-100 text-indigo-600 border-indigo-200",
  },
];

const Journal = () => {
  const dispatch = useDispatch();
  const today = useToday();
  const { current, all, searchResults, isSaving } = useSelector(
    (state) => state.journal,
  );

  const [content, setContent] = useState("");
  const [mood, setMood] = useState(3);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [preview, setPreview] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [saved, setSaved] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    dispatch(loadJournal(selectedDate));
    dispatch(loadAllJournals());
  }, [dispatch, selectedDate]);

  // Populate form when journal loads
  useEffect(() => {
    if (current) {
      setContent(current.content || "");
      setMood(current.mood || 3);
      setTags(current.tags || []);
    } else {
      setContent("");
      setMood(3);
      setTags([]);
    }
  }, [current]);

  const handleSave = () => {
  dispatch(saveJournal({ date: selectedDate, content, mood, tags }))
    .unwrap()
    .then(() => {
      dispatch(loadAllJournals())       // refresh sidebar
      dispatch(loadJournal(selectedDate)) // reload current

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
}

  const handleAddTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/,/g, "");
      if (!tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) dispatch(searchJournals(searchQ));
  };

  const clearSearchHandler = () => {
    setSearchQ("");
    dispatch(clearSearch());
  };

  const handleDeleteDate = (date) => {
  if (!date) return

  setDeleteError("")

  dispatch(deleteJournal(date))
    .unwrap()
    .then(() => {
      dispatch(loadAllJournals()) // refresh list

      if (selectedDate === date) {
        setSelectedDate(today)
      }
    })
    .catch((err) => setDeleteError(err || "Delete failed"))
}

  const displayList = searchResults || all;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Journal</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Daily reflections and notes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main editor */}
        <div className="space-y-4">
          {/* Date selector + mood */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={today}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  How did today feel?
                </label>
                <div className="flex gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      title={m.label}
                      className={`w-9 h-9 rounded-lg border text-base transition-all ${
                        mood === m.value
                          ? m.color + " scale-110 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-400 hover:scale-105"
                      }`}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
              <div className="flex gap-3">
                <button
                  onClick={() => setPreview(false)}
                  className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                    !preview
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Write
                </button>
                <button
                  onClick={() => setPreview(true)}
                  className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                    preview
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Preview
                </button>
              </div>
              <span className="text-[10px] text-slate-400">
                Markdown supported
              </span>
            </div>

            {!preview ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Write about ${selectedDate === today ? "today" : formatDisplayDate(selectedDate)}...\n\nWhat went well? What was hard? What did you learn?`}
                className="w-full px-5 py-4 text-sm text-slate-700 placeholder-slate-300 focus:outline-none resize-none font-mono leading-relaxed"
                style={{ minHeight: "320px" }}
              />
            ) : (
              <div className="px-5 py-4 prose prose-sm max-w-none min-h-[320px] text-slate-700">
                {content ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <p className="text-slate-300 text-sm">
                    Nothing to preview yet.
                  </p>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="px-5 py-3 border-t border-slate-100">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full px-2.5 py-0.5"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-indigo-300 hover:text-indigo-600 ml-0.5 leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags (press Enter)"
                className="text-xs text-slate-500 placeholder-slate-300 focus:outline-none w-full"
              />
            </div>

            {/* Save bar */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-400">
                {content.length} characters
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteDate(selectedDate)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    saved
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  }`}
                >
                  {saved ? "Saved!" : isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
            {deleteError && (
              <div className="px-5 py-2 text-[11px] text-red-600 bg-red-50 border-t border-red-100">
                {deleteError}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — past entries */}
        <div className="space-y-4">
          {/* Search */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search journals..."
                className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchResults ? (
                <button
                  type="button"
                  onClick={clearSearchHandler}
                  className="text-xs px-3 py-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Clear
                </button>
              ) : (
                <button
                  type="submit"
                  className="text-xs px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Search
                </button>
              )}
            </form>
          </div>

          {/* Entry list */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {searchResults
                ? `Results (${searchResults.length})`
                : "Recent entries"}
            </h3>
            {displayList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                {searchResults ? "No results found" : "No entries yet"}
              </p>
            ) : (
              <div className="space-y-2">
                {displayList.map((entry) => {
                  const moodData = MOODS.find((m) => m.value === entry.mood);
                  return (
                    <div
                      key={entry.date}
                      className={`w-full p-3 rounded-lg border transition-all ${
                        selectedDate === entry.date
                          ? "border-indigo-200 bg-indigo-50"
                          : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => setSelectedDate(entry.date)}
                          className="text-left flex-1"
                        >
                          <span className="text-xs font-medium text-slate-700">
                            {new Date(entry.date + "T12:00").toLocaleDateString(
                              "en",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                          {entry.content && (
                            <p className="text-[11px] text-slate-400 mt-1 truncate">
                              {entry.content.slice(0, 60)}...
                            </p>
                          )}
                          {entry.tags?.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {entry.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] text-indigo-400"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                        <div className="flex items-center gap-2">
                          {moodData && <span className="text-sm">{moodData.emoji}</span>}
                          <button
                            type="button"
                            onClick={() => handleDeleteDate(entry.date)}
                            className="text-[11px] text-red-600 font-semibold hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Journal;
