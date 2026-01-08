export const defaultPrompts = {
  CREATE_MOCK_CONVERSATIONS: `"your task is to generate {{max_conversation}} sample conversations between a brand and a customer, following the use case provided above in the BRIEF.
  brand names are displayed in the conversation as "{{brand_name}}"; for example, "Hi, welcome to {{brand_name}} how can I help you today".
  Some conversations will be positive, and some will be negative. Each conversation should have a minimum of 8 messages, and a maximum of 40, and multiple messages can come from the agent or consumer consecutively. Conversations should run their full course to completion, and only finish prematurely if the customer is angry and ends the conversation. A positive conversation is exemplified by: - agent was polite, courteous - welcomed the customer to chat on behalf of the company - listened to the customer to understand their issue and manage it professionally. - followed the correct process and successfully resolved the customer's query or concern - even if the customer is rude, the agent maintains professionalism and remains courteous In these conversations, the customer is more likely to be satisfied if their query is resolved. At times however, even if the agent is fantastic, the customer can still be upset and rude. A negative conversation may contain any of the following behaviours: - agent is not polite or courteous - agent does not take time to understand the customer's query - agent used poor spelling, grammar, or used ambigious language - agent is not welcoming, or just plain rude - agent misunderstands the customer's concerns - agent tries to resolve the incorrect query - agent uses the wrong customer name - agent does not follow process correct - the agent does not know the answer and is unable to adequately assist the customer - customer is frustrated by the agent, product, or brand - customer is aggressive, and uses profanity - customer is frustrated that the agent In these negative conversations, the customer is more likely to have low satisfaction, particularly when their query is not resolved.
  The output should be formatted as a JSON instance that conforms to the JSON schema below.
  The conversation format is as follows:
  OUTPUT_EXAMPLE:
    {
      "conversations": [
      {
        "experience": "positive",
        "messages": [
          { "role": "CONSUMER", "message": "yeah hi, I need some help please" },
          { "role": "ASSIGNED_AGENT", "message": "Hi, welcome to {{brand_name}} how can I help you today" },
          { "role": "CONSUMER", "message": "I need to get my contact details update please" } ] },
          { "experience": "negative", "messages": [ { "role": "CONSUMER", "message": "yeah hi, I need some help please" },
          { "role": "ASSIGNED_AGENT", "message": "Hi, welcome to {{brand_name}} how can I help you today" },
          { "role": "CONSUMER", "message": "this service suck, you screwed up my bill again" }
          ]
        }
      ]
    }

    You will create the conversation based on the use_case provided, and using the brand_name provided. Replace any instances of the customer's name with "CUSTOMER_NAME". The output will be formatted as a json_object response, as per the OUTOUT_EXAMPLE above. "
`
}