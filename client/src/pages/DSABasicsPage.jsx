import { useState } from 'react';
import { CheckCircle, Circle, Trophy, Code2 } from 'lucide-react';

const DSA_CATEGORIES = [
  {
    name: 'Basics', icon: '🔤',
    problems: [
      { id: 'b1', title: 'Hello World', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`, desc: 'Print Hello World to the console.' },
      { id: 'b2', title: 'Add Two Numbers', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}`, desc: 'Read two numbers and print their sum.' },
      { id: 'b3', title: 'Multiply Two Numbers', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;\n    return 0;\n}`, desc: 'Read two numbers and print their product.' },
      { id: 'b4', title: 'Swap Two Numbers', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    swap(a, b);\n    cout << a << " " << b << endl;\n    return 0;\n}`, desc: 'Swap two numbers without a temp variable.' },
    ]
  },
  {
    name: 'Conditions', icon: '🔀',
    problems: [
      { id: 'c1', title: 'Even or Odd', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    cout << (n % 2 == 0 ? "Even" : "Odd") << endl;\n    return 0;\n}`, desc: 'Check if a number is even or odd.' },
      { id: 'c2', title: 'Largest of Three', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    cout << max({a, b, c}) << endl;\n    return 0;\n}`, desc: 'Find the largest among three numbers.' },
      { id: 'c3', title: 'Positive, Negative or Zero', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    if (n > 0) cout << "Positive";\n    else if (n < 0) cout << "Negative";\n    else cout << "Zero";\n    return 0;\n}`, desc: 'Classify a number as positive, negative, or zero.' },
    ]
  },
  {
    name: 'Loops', icon: '🔁',
    problems: [
      { id: 'l1', title: 'Factorial', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    long long fact = 1;\n    for (int i = 2; i <= n; i++) fact *= i;\n    cout << fact << endl;\n    return 0;\n}`, desc: 'Calculate factorial of a number.' },
      { id: 'l2', title: 'Check Prime', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nbool isPrime(int n) {\n    if (n < 2) return false;\n    for (int i = 2; i * i <= n; i++)\n        if (n % i == 0) return false;\n    return true;\n}\nint main() {\n    int n;\n    cin >> n;\n    cout << (isPrime(n) ? "Prime" : "Not Prime") << endl;\n    return 0;\n}`, desc: 'Check if a number is prime.' },
      { id: 'l3', title: 'Fibonacci Series', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    int a = 0, b = 1;\n    for (int i = 0; i < n; i++) {\n        cout << a << " ";\n        int c = a + b; a = b; b = c;\n    }\n    return 0;\n}`, desc: 'Print first N Fibonacci numbers.' },
      { id: 'l4', title: 'Sum of Digits', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nint main() {\n    int n, sum = 0;\n    cin >> n;\n    while (n > 0) { sum += n % 10; n /= 10; }\n    cout << sum << endl;\n    return 0;\n}`, desc: 'Find the sum of digits of a number.' },
      { id: 'l5', title: 'Reverse a Number', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nint main() {\n    int n, rev = 0;\n    cin >> n;\n    while (n > 0) { rev = rev * 10 + n % 10; n /= 10; }\n    cout << rev << endl;\n    return 0;\n}`, desc: 'Reverse the digits of a number.' },
    ]
  },
  {
    name: 'Arrays', icon: '📦',
    problems: [
      { id: 'a1', title: 'Reverse an Array', difficulty: 'Easy', code: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<int> arr(n);\n    for (int& x : arr) cin >> x;\n    reverse(arr.begin(), arr.end());\n    for (int x : arr) cout << x << " ";\n    return 0;\n}`, desc: 'Reverse the elements of an array.' },
      { id: 'a2', title: 'Maximum Element', difficulty: 'Easy', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<int> arr(n);\n    for (int& x : arr) cin >> x;\n    cout << *max_element(arr.begin(), arr.end()) << endl;\n    return 0;\n}`, desc: 'Find the maximum element in an array.' },
      { id: 'a3', title: 'Sum of Array', difficulty: 'Easy', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<int> arr(n);\n    int sum = 0;\n    for (int& x : arr) { cin >> x; sum += x; }\n    cout << sum << endl;\n    return 0;\n}`, desc: 'Calculate the sum of all array elements.' },
      { id: 'a4', title: 'Second Largest', difficulty: 'Medium', code: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<int> arr(n);\n    for (int& x : arr) cin >> x;\n    sort(arr.begin(), arr.end(), greater<int>());\n    cout << arr[1] << endl;\n    return 0;\n}`, desc: 'Find the second largest element.' },
      { id: 'a5', title: 'Remove Duplicates', difficulty: 'Medium', code: `#include <iostream>\n#include <vector>\n#include <set>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    set<int> seen;\n    for (int i = 0; i < n; i++) {\n        int x; cin >> x;\n        if (seen.insert(x).second) cout << x << " ";\n    }\n    return 0;\n}`, desc: 'Remove duplicate elements from an array.' },
      { id: 'a6', title: 'Left Rotate Array', difficulty: 'Easy', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<int> arr(n);\n    for (int& x : arr) cin >> x;\n    int first = arr[0];\n    for (int i = 1; i < n; i++) arr[i-1] = arr[i];\n    arr[n-1] = first;\n    for (int x : arr) cout << x << " ";\n    return 0;\n}`, desc: 'Left rotate an array by one position.' },
    ]
  },
  {
    name: 'Strings', icon: '🔡',
    problems: [
      { id: 's1', title: 'Reverse a String', difficulty: 'Easy', code: `#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    reverse(s.begin(), s.end());\n    cout << s << endl;\n    return 0;\n}`, desc: 'Reverse a given string.' },
      { id: 's2', title: 'Check Palindrome', difficulty: 'Easy', code: `#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    string rev = s;\n    reverse(rev.begin(), rev.end());\n    cout << (s == rev ? "Palindrome" : "Not Palindrome") << endl;\n    return 0;\n}`, desc: 'Check if a string is a palindrome.' },
      { id: 's3', title: 'Count Vowels', difficulty: 'Easy', code: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    int count = 0;\n    for (char c : s)\n        if (string("aeiouAEIOU").find(c) != string::npos) count++;\n    cout << count << endl;\n    return 0;\n}`, desc: 'Count the number of vowels in a string.' },
      { id: 's4', title: 'Anagram Check', difficulty: 'Medium', code: `#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string a, b; cin >> a >> b;\n    sort(a.begin(), a.end());\n    sort(b.begin(), b.end());\n    cout << (a == b ? "Anagram" : "Not Anagram") << endl;\n    return 0;\n}`, desc: 'Check if two strings are anagrams.' },
    ]
  },
  {
    name: 'Recursion', icon: '🔄',
    problems: [
      { id: 'r1', title: 'Fibonacci (Recursive)', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nint fib(int n) {\n    if (n <= 1) return n;\n    return fib(n-1) + fib(n-2);\n}\nint main() {\n    int n; cin >> n;\n    cout << fib(n) << endl;\n    return 0;\n}`, desc: 'Find nth Fibonacci number using recursion.' },
      { id: 'r2', title: 'Factorial (Recursive)', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nlong long fact(int n) {\n    if (n <= 1) return 1;\n    return n * fact(n-1);\n}\nint main() {\n    int n; cin >> n;\n    cout << fact(n) << endl;\n    return 0;\n}`, desc: 'Calculate factorial using recursion.' },
      { id: 'r3', title: 'Power of a Number', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nlong long power(long long base, int exp) {\n    if (exp == 0) return 1;\n    return base * power(base, exp - 1);\n}\nint main() {\n    long long b; int e;\n    cin >> b >> e;\n    cout << power(b, e) << endl;\n    return 0;\n}`, desc: 'Calculate base^exp using recursion.' },
      { id: 'r4', title: 'Sum of N Numbers', difficulty: 'Easy', code: `#include <iostream>\nusing namespace std;\nint sum(int n) {\n    if (n == 0) return 0;\n    return n + sum(n-1);\n}\nint main() {\n    int n; cin >> n;\n    cout << sum(n) << endl;\n    return 0;\n}`, desc: 'Sum of first N natural numbers using recursion.' },
    ]
  },
  {
    name: 'STL Basics', icon: '📚',
    problems: [
      { id: 'stl1', title: 'Vector Operations', difficulty: 'Easy', code: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() {\n    vector<int> v = {5, 2, 8, 1, 9, 3};\n    sort(v.begin(), v.end());\n    cout << "Sorted: ";\n    for (int x : v) cout << x << " ";\n    cout << "\\nMax: " << v.back() << endl;\n    return 0;\n}`, desc: 'Basic vector operations: push, sort, access.' },
      { id: 'stl2', title: 'Stack Operations', difficulty: 'Easy', code: `#include <iostream>\n#include <stack>\nusing namespace std;\nint main() {\n    stack<int> st;\n    st.push(1); st.push(2); st.push(3);\n    while (!st.empty()) {\n        cout << st.top() << " ";\n        st.pop();\n    }\n    return 0;\n}`, desc: 'LIFO stack: push, pop, top operations.' },
      { id: 'stl3', title: 'Queue Operations', difficulty: 'Easy', code: `#include <iostream>\n#include <queue>\nusing namespace std;\nint main() {\n    queue<int> q;\n    q.push(1); q.push(2); q.push(3);\n    while (!q.empty()) {\n        cout << q.front() << " ";\n        q.pop();\n    }\n    return 0;\n}`, desc: 'FIFO queue: push, pop, front operations.' },
      { id: 'stl4', title: 'Map Operations', difficulty: 'Easy', code: `#include <iostream>\n#include <map>\nusing namespace std;\nint main() {\n    map<string, int> m;\n    m["apple"] = 3;\n    m["banana"] = 5;\n    m["cherry"] = 2;\n    for (auto& [k, v] : m)\n        cout << k << ": " << v << "\\n";\n    return 0;\n}`, desc: 'Key-value store with sorted keys.' },
      { id: 'stl5', title: 'Set Operations', difficulty: 'Easy', code: `#include <iostream>\n#include <set>\nusing namespace std;\nint main() {\n    set<int> s = {5, 2, 8, 2, 1, 8, 3};\n    cout << "Unique sorted elements: ";\n    for (int x : s) cout << x << " ";\n    return 0;\n}`, desc: 'Unique sorted elements using set.' },
    ]
  },
  {
    name: 'Sorting', icon: '📊',
    problems: [
      { id: 'sort1', title: 'Bubble Sort', difficulty: 'Easy', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nvoid bubbleSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 0; i < n-1; i++)\n        for (int j = 0; j < n-i-1; j++)\n            if (arr[j] > arr[j+1]) swap(arr[j], arr[j+1]);\n}\nint main() {\n    vector<int> arr = {64, 34, 25, 12, 22, 11};\n    bubbleSort(arr);\n    for (int x : arr) cout << x << " ";\n    return 0;\n}`, desc: 'O(n²) sorting by repeatedly swapping adjacent elements.' },
      { id: 'sort2', title: 'Selection Sort', difficulty: 'Easy', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nvoid selectionSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 0; i < n-1; i++) {\n        int minIdx = i;\n        for (int j = i+1; j < n; j++)\n            if (arr[j] < arr[minIdx]) minIdx = j;\n        swap(arr[i], arr[minIdx]);\n    }\n}\nint main() {\n    vector<int> arr = {64, 25, 12, 22, 11};\n    selectionSort(arr);\n    for (int x : arr) cout << x << " ";\n    return 0;\n}`, desc: 'Find minimum and place it in correct position.' },
      { id: 'sort3', title: 'Insertion Sort', difficulty: 'Easy', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nvoid insertionSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 1; i < n; i++) {\n        int key = arr[i], j = i - 1;\n        while (j >= 0 && arr[j] > key) { arr[j+1] = arr[j]; j--; }\n        arr[j+1] = key;\n    }\n}\nint main() {\n    vector<int> arr = {12, 11, 13, 5, 6};\n    insertionSort(arr);\n    for (int x : arr) cout << x << " ";\n    return 0;\n}`, desc: 'Build sorted array one element at a time.' },
    ]
  },
  {
    name: 'Searching', icon: '🔍',
    problems: [
      { id: 'sea1', title: 'Linear Search', difficulty: 'Easy', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> arr = {2, 3, 4, 10, 40};\n    int target = 10;\n    for (int i = 0; i < (int)arr.size(); i++)\n        if (arr[i] == target) { cout << "Found at index " << i; return 0; }\n    cout << "Not found";\n    return 0;\n}`, desc: 'Search element by checking each one.' },
      { id: 'sea2', title: 'Binary Search', difficulty: 'Easy', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nint binarySearch(vector<int>& arr, int target) {\n    int lo = 0, hi = arr.size() - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n}\nint main() {\n    vector<int> arr = {1, 3, 5, 7, 9, 11};\n    cout << "Index: " << binarySearch(arr, 7) << endl;\n    return 0;\n}`, desc: 'O(log n) search on sorted array.' },
    ]
  },
];

const TOTAL_PROBLEMS = DSA_CATEGORIES.reduce((sum, cat) => sum + cat.problems.length, 0);
const DIFFICULTY_COLORS = { Easy: 'badge-green', Medium: 'badge-orange', Hard: 'badge-red' };

export default function DSABasicsPage() {
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dsa_progress') || '{}'); } catch { return {}; }
  });
  const [selectedProblem, setSelectedProblem] = useState(DSA_CATEGORIES[0].problems[0]);
  const [activeCategory, setActiveCategory] = useState(DSA_CATEGORIES[0].name);

  const completedCount = Object.values(progress).filter(Boolean).length;

  const toggleDone = (id) => {
    setProgress(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      localStorage.setItem('dsa_progress', JSON.stringify(updated));
      return updated;
    });
  };

  const isCompleted = (id) => !!progress[id];
  const pct = Math.round((completedCount / TOTAL_PROBLEMS) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0px)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">DSA Basics 💻</div>
        <div className="page-subtitle">{completedCount}/{TOTAL_PROBLEMS} problems completed · {pct}%</div>
      </div>

      {/* Quote Banner */}
      <div style={{ padding: '0.75rem 1.5rem', background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
        <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: 1.6, maxWidth: '900px' }}>
          💡 <strong>Once you solve at least 80% of these basics of programming</strong>, you will be ready for LeetCode!
          After that, follow the <strong>Striver DSA Sheet</strong>, <strong>Apna College DSA Sheet</strong>,
          or <strong>Neetcode 250 Sheet</strong> and <strong>learn pattern-wise</strong>. Consistency beats talent every time. 🔥
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '0.5rem 1.5rem', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', minWidth: '80px' }}>
            {completedCount} / {TOTAL_PROBLEMS}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div className="dsa-sidebar" style={{ padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
          {DSA_CATEGORIES.map(cat => (
            <div key={cat.name} style={{ marginBottom: '0.1rem' }}>
              <button
                onClick={() => setActiveCategory(activeCategory === cat.name ? '' : cat.name)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.6rem', borderRadius: '6px', cursor: 'pointer',
                  background: activeCategory === cat.name ? '#eff6ff' : 'transparent',
                  border: 'none', fontSize: '0.85rem', fontWeight: 600,
                  color: activeCategory === cat.name ? '#1d4ed8' : '#374151',
                  transition: 'all 0.15s'
                }}
              >
                <span>{cat.icon}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{cat.name}</span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  {cat.problems.filter(p => progress[p.id]).length}/{cat.problems.length}
                </span>
              </button>
              {activeCategory === cat.name && (
                <div style={{ paddingLeft: '0.3rem' }}>
                  {cat.problems.map(p => (
                    <div
                      key={p.id}
                      className={`dsa-topic ${selectedProblem?.id === p.id ? 'active' : ''} ${isCompleted(p.id) ? 'done' : ''}`}
                      onClick={() => setSelectedProblem(p)}
                    >
                      {isCompleted(p.id)
                        ? <CheckCircle size={13} color="#16a34a" />
                        : <Circle size={13} color="#d1d5db" />}
                      <span style={{ flex: 1 }}>{p.title}</span>
                      <span className={`badge ${DIFFICULTY_COLORS[p.difficulty]}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                        {p.difficulty[0]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right: problem detail */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {pct === 100 && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1.25rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              <Trophy size={36} color="#d97706" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#15803d', marginBottom: '0.3rem' }}>🎉 Congratulations!</div>
              <p style={{ color: '#16a34a', fontSize: '0.9rem' }}>You have completed all basics! You are now ready for Striver's DSA Sheet 🚀</p>
            </div>
          )}

          {selectedProblem ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a202c', marginBottom: '0.35rem' }}>
                    {selectedProblem.title}
                  </h1>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <span className={`badge ${DIFFICULTY_COLORS[selectedProblem.difficulty]}`}>{selectedProblem.difficulty}</span>
                    {isCompleted(selectedProblem.id) && <span className="badge badge-green">✓ Done</span>}
                  </div>
                </div>
                <button
                  onClick={() => toggleDone(selectedProblem.id)}
                  className={`btn btn-sm ${isCompleted(selectedProblem.id) ? 'btn-outline' : 'btn-primary'}`}
                >
                  {isCompleted(selectedProblem.id)
                    ? <><Circle size={13} /> Mark Undone</>
                    : <><CheckCircle size={13} /> Mark as Done</>}
                </button>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.7, marginBottom: '1rem' }}>
                {selectedProblem.desc}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <Code2 size={15} color="#1d4ed8" />
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>C++ Solution</span>
              </div>
              <pre className="code-block">{selectedProblem.code}</pre>

              {/* Prev / Next */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', gap: '1rem' }}>
                {(() => {
                  const all = DSA_CATEGORIES.flatMap(c => c.problems);
                  const idx = all.findIndex(p => p.id === selectedProblem.id);
                  const prev = all[idx - 1];
                  const next = all[idx + 1];
                  return (
                    <>
                      {prev ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => {
                          setSelectedProblem(prev);
                          setActiveCategory(DSA_CATEGORIES.find(c => c.problems.some(p => p.id === prev.id))?.name || '');
                        }}>← {prev.title}</button>
                      ) : <div />}
                      {next && (
                        <button className="btn btn-primary btn-sm" onClick={() => {
                          setSelectedProblem(next);
                          setActiveCategory(DSA_CATEGORIES.find(c => c.problems.some(p => p.id === next.id))?.name || '');
                        }}>{next.title} →</button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Code2 size={36} />
              <p>Select a topic from the left to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

