import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export async function POST(req: Request) {
    try {
      // Parse the JSON body from the request
      const body = await req.json();
  
      const { locationId, oprndate } = body;
  
      // Validate input
      if (!locationId || !oprndate) {
        return new Response(JSON.stringify({ error: 'Missing locationId or oprndate in request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      // Prepare JSON request payload
      const payload = {
        Request: {
          Header: {
            Version: "1.0.0.1",
            ReqDt: oprndate,
            RequestName: "GetShowTimesByLocation",
            Channel: "KIOSK",
          },
          Body: {
            locationid: locationId,
            oprndate: oprndate,
          },
        },
      };
  
      // Send Axios request
      const response = await axios.post(
        'http://192.168.50.40/CineShowTimeWs/asmx/EasiCineShowTimeWs.asmx/getShowTimesByLocation',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const jsonResponse = await response.data;
  
      // Return successful response
      return new Response(JSON.stringify({ data: jsonResponse }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      console.error('Error in POST handler:', error.message || error);
  
      // Handle Axios errors
      if (axios.isAxiosError(error) && error.response) {
        console.error('SOAP Error Response:', error.response.data);
        return new Response(JSON.stringify({
          error: 'SOAP request failed',
          details: error.response.data,
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      // Return a general internal server error
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
