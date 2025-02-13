import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { locationId, oprndate } = body;

    if (!locationId || !oprndate) {
      return NextResponse.json(
        { error: 'Missing locationId or oprndate in request body' },
        { status: 400 }
      );
    }

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

    const response = await axios.post(
      'http://192.168.50.40/CineShowTimeWs/asmx/EasiCineShowTimeWs.asmx/getShowTimesByLocation',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({ data: response.data });
  } catch (error: unknown) {
    console.error('Error in POST handler:', error);

    if (axios.isAxiosError(error)) {
      console.error('SOAP Error Response:', error.response?.data);
      return NextResponse.json(
        { error: 'SOAP request failed', details: error.response?.data },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}