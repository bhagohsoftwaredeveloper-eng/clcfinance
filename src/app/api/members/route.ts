import { NextRequest, NextResponse } from 'next/server';
import { getAllMembers, createMember, updateMember, deleteMember } from '@/lib/database';
import type { RawMember } from '@/lib/types';
import { validateMember } from '@/lib/validation';

// Postgres raises code 23505 (unique_violation); the members_email_key
// constraint is on the email column.
function isDuplicateEmailError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === '23505' &&
    (error as { constraint?: string }).constraint === 'members_email_key'
  );
}

export async function GET() {
  try {
    const members = (await getAllMembers()) as RawMember[];
    // Transform field names to match frontend expectations
    const transformedMembers = members.map((member) => ({
      ...member,
      joinDate: member.join_date,
      avatarUrl: member.avatar_url
    }));
    return NextResponse.json(transformedMembers);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const member = await request.json();

    const validationError = validateMember(member);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const memberToCreate = {
      id: member.id || `m${Date.now()}`,
      name: member.name,
      email: member.email || null,
      phone: member.phone || null,
      join_date: member.joinDate || new Date().toISOString().split('T')[0],
      avatar_url: member.avatarUrl || null,
      address: member.address || null,
      network: member.network
    };

    await createMember(memberToCreate);

    return NextResponse.json({ success: true, member: memberToCreate });
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      return NextResponse.json(
        { error: 'A member with this email already exists.' },
        { status: 409 }
      );
    }
    console.error('Error creating member:', error);
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const member = await request.json();

    if (!member.id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }
    const validationError = validateMember(member);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const memberToUpdate = {
      id: member.id,
      name: member.name,
      email: member.email || null,
      phone: member.phone || null,
      join_date: member.joinDate,
      avatar_url: member.avatarUrl || null,
      address: member.address || null,
      network: member.network
    };

    await updateMember(member.id, memberToUpdate);

    return NextResponse.json({ success: true, member });
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      return NextResponse.json(
        { error: 'A member with this email already exists.' },
        { status: 409 }
      );
    }
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
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
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    await deleteMember(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    );
  }
}
