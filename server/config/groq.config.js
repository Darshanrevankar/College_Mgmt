import Groq from "groq-sdk";

grop = 'gsk_ID9G34NklReRkNGp'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY});

export async function processAcademicData(newData,oldData) {
    const chatCompletion = await getGroqChatCompletion(newData,oldData);
    console.log('\n\nconfig/groq.config.js : ',JSON.parse(chatCompletion.choices[0].message.content),);
}

const getGroqChatCompletion = async (data) => {
    return groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "you are a helpful assistant.",
        },
        
      ], 

      model: "llama-3.2-90b-vision-preview",
      temperature: 0.5,
      response_format: { type: "json_object" },
      top_p: 1,
      stop: null,
      stream: false,
    });
  };




  const data = [{
    role: "user",
    content: `Update the subjects from this old data  and with respect to the new data. 
    Analyze the subCode and subName properly from both of the new data and old data, and modify the old data, keeping the subCredits same as old data. Return only the modified data in JSON format with academicData: [{subName: 'Replace with new data's subName', subCode:'Replace with new data's subCode', subCredits marks: 'marks from new Data', result :'pass/fail'}].",
      "If no relevant information is found, return empty JSON as academicData: []"
    `,
  },
  {
      role: "user",
      content : ` 
         old data: ${
          {
              sem: '6',
              subjects: [
                {
                  subName: 'Software Engineering & Project Management',
                  subCode: 'HSMC21CS61',
                  subCredits: 3,
                  marks: 0,
                  result: 'pass',
              
                },
                {
                  subName: 'Fullstack Development',
                  subCode: 'IPCC21CS62',
                  subCredits: 4,
                  marks: 0,
                  result: 'pass',
          
                },
                {
                  subName: 'Computer Graphics and Fundamentals of Image Processing',
                  subCode: 'PCC21CS63',
                  subCredits: 3,
                  marks: 0,
                  result: 'pass',
      
                },
                {
                  subName: 'Professional Elective Course-I',
                  subCode: 'PEC21XX64X',
                  subCredits: 3,
                  marks: 0,
                  result: 'pass',
          
                },
                {
                  subName: 'Open Elective Course-I',
                  subCode: 'OEC21XX65X',
                  subCredits: 3,
                  marks: 0,
                  result: 'pass',
      
                },
                {
                  subName: 'Computer Graphics and Image Processing Laboratory',
                  subCode: 'PCC21CSL66',
                  subCredits: 1,
                  marks: 0,
                  result: 'pass',
              
                },
                {
                  subName: 'Mini Project',
                  subCode: 'MP21CSMP67',
                  subCredits: 2,
                  marks: 0,
                  result: 'pass',
          
                },
                {
                  subName: 'Innovation/Entrepreneurship /Societal Internship',
                  subCode: 'INT21INT68',
                  subCredits: 3,
                  marks: 0,
                  result: 'pass',
              
                }
              ],
              sgpa: 0,
            }
        }, 

        new Data : ${
          {
              subName: 'SOFTWARE ENGINEERING AND PROJECT MANAGEMENT',
              subCode: '21CS61',
              marks: '77'
            },
            { subName: 'FULL STACK DEVELOPMENT', subCode: '21CS62', marks: '92' },
            {
              subName: 'COMPUTER GRAPHICS AND FUNDAMENTALS OF IMAGE PROCESSING',
              subCode: '21CS63',
              marks: '80'
            },
            {
              subName: 'ELECTRONIC CIRCUITS WITH VERILOG',
              subCode: '21EC654',
              marks: '90'
            },
            {
              subName: 'DATA SCIENCE AND VISUALIZATION',
              subCode: '21CS644',
              marks: '83'
            },
            {
              subName: 'COMPUTER GRAPHICS AND IMAGE PROCESSING LABORATORY',
              subCode: '21CSL66',
              marks: '92'
            },
            { subName: 'MINI PROJECT', subCode: '21CSMP67', marks: '99' },
            { subName: 'SOCIETAL INTERNSHIP', subCode: '21INT68', marks: '99' }
          }
          ]
        },
          
        
      `,
  }, 
  {
      role: "system",
      content: `${
          {
          academicData : [
              {
                subName: 'Software Engineering & Project Management',
                subCode: '21CS61',
                subCredits: 3,
                marks: 77,
                result: 'pass'
              },
              {
                subName: 'Fullstack Development',
                subCode: '21CS62',
                subCredits: 4,
                marks: 92,
                result: 'pass'
              },
              {
                subName: 'Computer Graphics and Fundamentals of Image Processing',
                subCode: '21CS63',
                subCredits: 3,
                marks: 80,
                result: 'pass'
              },
              {
                subName: 'Data Science and Visualization',
                subCode: '21CS644',
                subCredits: 3,
                marks: 83,
                result: 'pass'
              },
              {
                subName: 'Electronics Circuits with Verilog',
                subCode: '21CS654',
                subCredits: 3,
                marks: 90,
                result: 'pass'
              },
              {
                subName: 'Computer Graphics and Image Processing Laboratory',
                subCode: '21CSL66',
                subCredits: 1,
                marks: 92,
                result: 'pass'
              },
              {
                subName: 'Mini Project',
                subCode: '21CSMP67',
                subCredits: 2,
                marks: 99,
                result: 'pass'
              },
              {
                subName: 'Innovation/Entrepreneurship /Societal Internship',
                subCode: '21INT68',
                subCredits: 3,
                marks: 99,
                result: 'pass'
              }
            ]
          }
        }`
  }]