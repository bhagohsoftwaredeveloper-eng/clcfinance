import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '@/lib/database';
import { validateEvent } from '@/lib/validation';

export async function GET() {
  try {
    const events = await getAllEvents();
    // Normalize dates to ISO strings (DB may return Date or string) and sort ascending
    const transformedEvents = (events as any[])
      .map((event) => ({
        ...event,
        date: new Date(event.date).toISOString(),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return NextResponse.json(transformedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    const validationError = validateEvent(event);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const eventToCreate = {
      id: event.id,
      title: event.title,
      // date arrives as a string from JSON; normalize defensively
      date: new Date(event.date).toISOString(),
      description: event.description ?? '',
      resource: event.resource
    };

    await createEvent(eventToCreate);

    return NextResponse.json({ success: true, event: eventToCreate });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const event = await request.json();

    if (!event.id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    const validationError = validateEvent(event);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const eventToUpdate = {
      id: event.id,
      title: event.title,
      date: new Date(event.date).toISOString(),
      description: event.description ?? '',
      resource: event.resource
    };

    await updateEvent(event.id, eventToUpdate);

    return NextResponse.json({ success: true, event: eventToUpdate });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    await deleteEvent(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
