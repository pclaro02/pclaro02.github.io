const BASEURL = "http://127.0.0.1:8000/api/";


const SUBMISSION_STATUS = {
  "C": "Submissão criada.",
  "R": "A testar submissão...",
  "F": "Testes terminados.",
  "T": "Submissão excedeu o tempo.",
  "E": "Excepção a correr a submissão!",
  "N": "Sem nada a apresentar..."
}


const SUBMISSION_RESULTS = {
  "P": "Passou todos os testes!",
  "I": "Não passou todos os testes...",
  "N": "Não foram encontradas submissões..."
}


/**
 * Make an API call to get the challenges list. Only active (visible)
 * challenges are returned.
 * @returns {Array} Returns an array of challenges in the form of Objects
 * with the following keys:
 * * id: Number
 * * name: String
 */
async function getChallengesList(){
  const res = await fetch(BASEURL + "challenges/");
  return await res.json();
}


/**
 * Make an API call to get a specific challenge's details. Only active
 * (visible) challenges are able to be retrieved.
 * @param {Number} challengeId The challenge's Id.
 * @returns {Object} The challenge's details with the following keys:
 * * id: Number
 * * name: String
 * * question: String (formatted as HTML)
 */
async function getChallengeDetails(challengeId){
  const res = await fetch(BASEURL + `challenges/${challengeId}`);
  return await res.json();
}


/**
 * Make an API call to get a group's submissions.
 * @param {Number} groupNumber The group's number.
 * @param {String} groupPassword The group's assigned password.
 * @returns {Array} Returns an array of submissions in the form of Objects
 * with the following keys:
 * * id: Number
 * * challenge: Number (Id)
 * * status: String (single character)
 * * * Values in Backend.app.submissions.models.Submission
 * * time: String (Valid datetime string format)
 */
async function getSubmissionsList(groupNumber, groupPassword){
  const res = await fetch(BASEURL + "submissions/list", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({group: groupNumber, password: groupPassword})
  });
  if(res.status == 200) return await res.json();
  else throw new Error(await res.text());
}


/**
 *
 * @param {Number} groupNumber
 * @param {String} groupPassword
 * @returns {Array} Returns an array of results in the form of Objects with
 * the following keys:
 * * challenge: Number (Id)
 * * result: String (single character)
 * * * Values in Backend.app.submissions.views.Results
 * This returns results only for active leet code Challenges.
 */
async function getSubmissionsResults(groupNumber, groupPassword){
  const res = await fetch(BASEURL + "submissions/results", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({group: groupNumber, password: groupPassword})
  });
  if(res.status == 200) return await res.json();
  else throw new Error(await res.text());
}


/**
 * Make an API call to make a new submission.
 * This may be a very lengthy call, as leet code is evaluated on the spot.
 * @param {Number} groupNumber The group's number.
 * @param {String} groupPassword The group's assigned password.
 * @param {Number} challengeId The challenge's Id.
 * @param {File} submissionFile The file to be submitted.
 * @returns {Object} Returns an Object with the following keys:
 * * id: Number
 * * status: String (single Character)
 * * * Values in Backend.app.submissions.models.Submission
 */
async function makeSubmission(groupNumber, groupPassword, challengeId, submissionFile){
  const payload = {
    group: groupNumber,
    password: groupPassword,
    challenge: challengeId,
    file: submissionFile
  };
  // Files have to be sent trough a FormData
  let formData = new FormData;
  Object.keys(payload).forEach((key) => formData.append(key, payload[key]));
  const res = await fetch(BASEURL + "submissions/", {
    method: "POST",
    body: formData
  });
  if(res.status == 200) return await res.json();
  else throw new Error(await res.text());
}
