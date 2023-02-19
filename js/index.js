// Element references --------------------------------------------------------
const ulTabs = document.querySelector("#ul-tabs");
const anchorChallenges = document.querySelector("#anchor-challenges");
const tabChallenges = document.querySelector("#tab-challenges");
const templateChallengeCard = document.querySelector(
  "#template-challenge-card"
);
const templateGetResults = document.querySelector("#template-get-results");
const modalChallenge = document.querySelector("#modal-challenge")
const challengeForm = modalChallenge.querySelector("form");
const modalLoading = document.querySelector("#modal-loading");


// Setup ---------------------------------------------------------------------
anchorChallenges.addEventListener("click", () => {
  M.Tabs.getInstance(ulTabs).select("tab-challenges");
});

// Setup the Modal Challenge
M.Modal.init(modalChallenge, {
  onOpenStart: async () => {
    // Clear the form and table and error message
    modalChallenge.querySelector("#row-table-results").classList.add("hide");
    modalChallenge.querySelector("table tbody").innerHTML = "";
    modalChallenge.querySelector("#error-message").classList.add("hide");
    challengeForm.reset();
    // Get the challenge details and set them.
    const info = await getChallengeDetails(modalChallenge.dataset.id);
    modalChallenge.querySelector("#modal-title").textContent = info.name;
    modalChallenge.querySelector("#modal-content").innerHTML = info.question;
  }
});
challengeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  // Show the loading Modal
  M.Modal.getInstance(modalLoading).open();
  // Clear any previous errors
  modalChallenge.querySelector("#error-message").classList.add("hide");
  const data = new FormData(challengeForm);
  const groupNumber = data.get("group-number");
  const password = data.get("password");
  const challengeId = modalChallenge.dataset.id;
  const file = data.get("file");
  try {
    const res = await makeSubmission(groupNumber, password, challengeId, file);

    // Log the result on the table
    modalChallenge.querySelector("#row-table-results").classList.remove("hide");
    const table = modalChallenge.querySelector("table");
    let newRecord = document.createElement("tr");
    newRecord.innerHTML = `
      <td>${res.id}</td>
      <td>${SUBMISSION_STATUS[res.status]}</td>
      <td>${res.result ? SUBMISSION_RESULTS[res.result] : "-"}</td>
    `;
    table.querySelector("tbody").appendChild(newRecord);
  } catch (e) {
    modalChallenge.querySelector("#error-message").textContent = String(e);
    modalChallenge.querySelector("#error-message").classList.remove("hide");
  }
  M.Modal.getInstance(modalLoading).close();
});
// Setup the Modal Loading
M.Modal.init(modalLoading, {
  dismissible: false,
  endingTop: "50%",
  inDuration: 0,
  outDuration: 0
});

// Look for challenges
async function setupChallenges(){
  const retval = await getChallengesList();
  if(retval.length === 0) return;
  tabChallenges.innerHTML = "";
  // Create an initial row
  let row = document.createElement("div");
  row.classList.add("row");
  tabChallenges.appendChild(row);
  for(challenge of retval){
    const id = challenge.id;
    const name = challenge.name
    // Create a card for the challenge and append it
    const clone = templateChallengeCard.content.cloneNode(true).querySelector(
      "div"
    );
    clone.querySelector(".card").dataset.id = id;
    clone.querySelector("span").textContent = name;
    row.appendChild(clone);
    // Add functionality
    clone.querySelector(".card").addEventListener("click", () => {
      modalChallenge.dataset.id = id;
      M.Modal.getInstance(modalChallenge).open();
    });
  }
  // Adjust in the case that it's not a multiple of three
  switch(retval.length % 3){
    case 1:
      row.lastElementChild.classList.add("offset-l4")
      break;
    case 2:
      row.lastElementChild.previousSibling.classList.add("offset-l2")
      break;
    default:
      break;
  }
  // Create the row to get results
  let formGetResults = templateGetResults.content.cloneNode(
    true
  ).querySelector("form");
  formGetResults.addEventListener("submit", async (event) => {
    event.preventDefault();
    const pGetResultsError = formGetResults.querySelector(
      "#p-get-results-error"
    );
    pGetResultsError.classList.add("hide");
    const data = new FormData(formGetResults);
    const groupNumber = data.get("group-number");
    const password = data.get("password");
    try {
      const res = await getSubmissionsResults(groupNumber, password);
      console.log(res);
      for(result of res){
        let card = document.querySelector(
          `.card[data-id="${result.challenge}"]`
        );
        card.classList = ["card"];
        if(result.result === "P") card.classList.add("green-bg");
        else if(result.result === "I") card.classList.add("yellow-bg");
      }
    } catch (e) {
      pGetResultsError.textContent = String(e);
      pGetResultsError.classList.remove("hide");
    }
  });
  tabChallenges.appendChild(formGetResults);
  M.Tooltip.init(document.querySelector(".tooltipped"));
}
setupChallenges();

// Plugins inits
M.AutoInit();
hljs.highlightAll();
